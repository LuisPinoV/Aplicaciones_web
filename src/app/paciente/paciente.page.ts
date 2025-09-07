import { Component } from '@angular/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonItem, IonLabel, IonAvatar, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonList, IonIcon, IonButton
} from '@ionic/angular/standalone';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { PatientStoreService, Patient } from '../services/patient-store.service';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.page.html',
  styleUrls: ['./paciente.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonItem, IonLabel, IonAvatar, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonList, IonIcon, NgIf, IonButton, RouterModule, NgFor
  ]
})

export class PacientePage {
  rutParam = '';
  patient: Patient | null = null;

  constructor(private route: ActivatedRoute, private store: PatientStoreService, private router: Router) {
    this.rutParam = this.route.snapshot.paramMap.get('rut') ?? '';
    this.patient = (history.state as any)?.patient ?? null;
    if (!this.patient && this.rutParam) {
      this.patient = this.store.getByRut(this.rutParam);
    }
  }

  get displayAge(): string {
    if (!this.patient) return '—';
    if (this.patient.age != null) return `${this.patient.age} años`;
    if (this.patient.birthdate) return `${this.computeAge(this.patient.birthdate)} años`;
    return '—';
  }

  get displaySex(): string {
    const s = (this.patient?.sex || '').toString().toUpperCase();
    if (s === 'F') return 'Femenino';
    if (s === 'M') return 'Masculino';
    return this.patient?.sex || '—';
  }

  getInitials(fullName?: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  private computeAge(dateStr: string): number {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return NaN as any;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }

  private normalize(text: string): string {
    return (text || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\.\-]/g, '')
      .trim();
  }

  private normalizeRut(rut: string): string {
    return this.normalize(rut).replace(/[^0-9k]/g, '');
  }
}