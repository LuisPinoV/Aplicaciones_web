import { Component } from '@angular/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonAvatar, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonInput
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientStoreService, Patient } from '../services/patient-store.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonItem, IonList, IonHeader, IonToolbar, IonTitle, IonContent,
    IonAvatar, IonButton, IonIcon, IonLabel, IonInput, NgIf, NgFor, FormsModule
  ],
})

export class Tab1Page {
  query = '';

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];

  constructor(private router: Router, private store: PatientStoreService) {
    this.patients = this.store.all();
    this.filteredPatients = [...this.patients];
  }

  onSearch(): void {
    const q = this.normalize(this.query);
    if (!q) { this.filteredPatients = [...this.patients]; return; }

    this.filteredPatients = this.patients.filter(p => {
      const name = this.normalize(p.name);
      const rut  = this.normalizeRut(p.rut);
      return name.includes(q) || rut.includes(q);
    });
  }

  getInitials(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
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

  goToPatient(p: Patient) {
    const id = this.normalizeRut(p.rut);
    this.router.navigate(['/paciente', id], { state: { patient: p } });
  }

  goToCrearPaciente() {
    this.router.navigate(['/crear-paciente']);
  }
}
