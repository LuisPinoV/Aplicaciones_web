import { Component } from '@angular/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonIcon
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { PatientStoreService, Patient } from '../services/patient-store.service';

@Component({
  selector: 'app-diagnosticos',
  templateUrl: './diagnosticos.page.html',
  styleUrls: ['./diagnosticos.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonList, IonItem, IonLabel, IonIcon, NgIf, NgFor
  ]
})
export class DiagnosticosPage {
  rutParam = '';
  patient: Patient | null = null;

  diagnos = [
    { code: 'J00', name: 'Resfriado común', date: '2025-08-21' },
    { code: 'I10', name: 'Hipertensión esencial (primaria)', date: '2025-07-03' },
    { code: 'E11', name: 'Diabetes mellitus tipo 2', date: '2025-03-18' }
  ];

  constructor(private route: ActivatedRoute, private store: PatientStoreService) {
    this.rutParam = this.route.snapshot.paramMap.get('rut') ?? '';
    this.patient = (history.state as any)?.patient ?? null;
    if (!this.patient && this.rutParam) {
      this.patient = this.store.getByRut(this.rutParam);
    }
  }
}
