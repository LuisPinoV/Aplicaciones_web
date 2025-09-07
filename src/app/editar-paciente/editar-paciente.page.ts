import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { PatientStoreService, Patient } from '../services/patient-store.service';

@Component({
  selector: 'app-editar-paciente',
  templateUrl: './editar-paciente.page.html',
  styleUrls: ['./editar-paciente.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonButtons, IonBackButton]
})

export class EditarPacientePage implements OnInit {
  rutParam = '';
  patient: Patient | null = null;

  constructor(private route: ActivatedRoute, private store: PatientStoreService) {
      this.rutParam = this.route.snapshot.paramMap.get('rut') ?? '';
      this.patient = (history.state as any)?.patient ?? null;
      if (!this.patient && this.rutParam) {
        this.patient = this.store.getByRut(this.rutParam);
      }
    }

  ngOnInit() {
  }

}
