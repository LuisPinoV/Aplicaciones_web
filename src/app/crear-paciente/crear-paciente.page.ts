import { Component } from '@angular/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonButton, IonToast, IonNote
} from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientStoreService, Patient } from '../services/patient-store.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-crear-paciente',
  templateUrl: './crear-paciente.page.html',
  styleUrls: ['./crear-paciente.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonButton, IonToast, ReactiveFormsModule, NgIf, IonNote
  ]
})
export class CrearPacientePage {
  toastOpen = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    rut: ['', [Validators.required, rutValidator]],
    birthdate: ['', Validators.required],
    sex: ['', Validators.required],
    bloodGroup: ['', Validators.required],
    phone: ['', [Validators.pattern(/^[\d +()\-]{7,20}$/)]],
    email: ['', [Validators.email]]
  });

  constructor(private fb: FormBuilder, private store: PatientStoreService, private router: Router) {}

  submit() {
    if (this.form.invalid) return;

    const v = this.form.value;
    const patient: Patient = {
      name: v.name!,
      rut: this.formatRutString(v.rut!),
      avatarUrl: null,
      birthdate: v.birthdate!,
      sex: v.sex as any,
      bloodGroup: v.bloodGroup!,
      phone: v.phone || '',
      email: v.email || ''
    };

    this.store.add(patient);
    this.toastOpen = true;

    const rutId = this.store['cleanRut'](patient.rut);
    setTimeout(() => this.router.navigate(['/paciente', rutId], { state: { patient } }), 700);
  }

  formatRut() {
    const ctrl = this.form.controls.rut;
    if (ctrl.invalid) return;
    ctrl.setValue(this.formatRutString(ctrl.value || ''));
  }

  private formatRutString(raw: string): string {
    const s = (raw || '').replace(/\./g, '').replace(/-/g, '').toLowerCase();
    if (!s) return '';
    const body = s.slice(0, -1);
    const dv = s.slice(-1);
    const bodyFmt = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${bodyFmt}-${dv}`;
  }
}

export function rutValidator(ctrl: AbstractControl): ValidationErrors | null {
  const raw = (ctrl.value || '').toString().toLowerCase().replace(/\./g, '').replace(/-/g, '');
  if (!raw) return null;
  if (!/^\d+k?$/.test(raw)) return { rut: 'formato' };
  const body = raw.slice(0, -1);
  const dv = raw.slice(-1);

  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = (mul === 7) ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? '0' : res === 10 ? 'k' : String(res);
  return dv === dvCalc ? null : { rut: 'dv' };
}
