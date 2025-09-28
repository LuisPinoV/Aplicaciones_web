import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { medical, documentText, documentAttach, calendar, warning, checkmark, checkmarkCircle } from 'ionicons/icons';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  time: string;
  instructions: string;
  isUrgent: boolean;
  taken?: boolean;
}

interface Activity {
  id: number;
  title: string;
  time: string;
  type: string;
  icon: string;
  badge?: string;
  progress?: boolean;
}

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [ IonicModule, CommonModule, FormsModule ]
})
export class Tab3Page implements OnInit {

  // Data properties
  pendingMedications: number = 2;
  activeMedications: number = 5;
  monthlyExams: number = 3;

  todayMedications: Medication[] = [
    {
      id: 1,
      name: 'Omeprazol 20mg',
      dosage: '1 cápsula',
      time: '08:00',
      instructions: 'Antes del desayuno',
      isUrgent: true
    },
    {
      id: 2,
      name: 'Vitamina D3',
      dosage: '2 gotas',
      time: '20:00',
      instructions: 'Con la cena',
      isUrgent: false
    }
  ];

  recentActivities: Activity[] = [
    {
      id: 1,
      title: 'Omeprazol tomado',
      time: 'Ayer, 8:00 AM',
      type: 'medication',
      icon: 'medical',
      progress: true
    },
    {
      id: 2,
      title: 'Examen de sangre subido',
      time: '3 días atrás',
      type: 'exam',
      icon: 'document-text'
    },
    {
      id: 3,
      title: 'Nueva receta agregada',
      time: '1 semana atrás',
      type: 'medication',
      icon: 'medical',
      badge: 'Nuevo'
    }
  ];

  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Add icons to be used in the template
    addIcons({
      medical,
      documentText,
      documentAttach,
      calendar,
      warning,
      checkmark,
      checkmarkCircle
    });
  }

  ngOnInit() {
    // Initialize component
    console.log('Tab3Page initialized');
  }

  // Medication Actions
  async markAsTaken(medication: Medication) {
    medication.taken = true;
    this.pendingMedications--;
    
    const toast = await this.toastController.create({
      message: `${medication.name} marcado como tomado`,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  async skipMedication(medication: Medication) {
    const alert = await this.alertController.create({
      header: 'Omitir medicamento',
      message: `¿Estás seguro de que quieres omitir ${medication.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Omitir',
          handler: () => {
            this.pendingMedications--;
            this.showSkipToast(medication);
          }
        }
      ]
    });
    await alert.present();
  }

  private async showSkipToast(medication: Medication) {
    const toast = await this.toastController.create({
      message: `${medication.name} omitido`,
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
  }

  // Navigation Actions
  viewAllMedications() {
    console.log('Navigate to all medications');
    // Implement navigation to medications list
  }

  viewHistory() {
    console.log('Navigate to activity history');
    // Implement navigation to history
  }

  // Quick Actions
  async addMedication() {
    const toast = await this.toastController.create({
      message: 'Abriendo formulario de medicamentos...',
      duration: 1500,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
    
    console.log('Navigate to add medication');
    // Implement navigation to add medication form
  }

  async addExam() {
    const toast = await this.toastController.create({
      message: 'Abriendo cámara/galería...',
      duration: 1500,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
    
    console.log('Open camera/gallery for exam upload');
    // Implement camera/gallery functionality
  }

  async scheduleAppointment() {
    const toast = await this.toastController.create({
      message: 'Abriendo calendario...',
      duration: 1500,
      color: 'secondary',
      position: 'bottom'
    });
    await toast.present();
    
    console.log('Navigate to appointment scheduler');
    // Implement appointment scheduling
  }

  async emergency() {
    const alert = await this.alertController.create({
      header: 'Emergencia Médica',
      message: '¿Necesitas contactar servicios de emergencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Llamar 911',
          handler: () => {
            this.callEmergency();
          }
        },
        {
          text: 'Contactos de emergencia',
          handler: () => {
            this.showEmergencyContacts();
          }
        }
      ]
    });
    await alert.present();
  }

  private callEmergency() {
    // In a real app, this would make a phone call
    console.log('Calling emergency services');
    window.open('tel:911', '_system');
  }

  private async showEmergencyContacts() {
    const toast = await this.toastController.create({
      message: 'Mostrando contactos de emergencia...',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
    
    console.log('Show emergency contacts');
    // Implement emergency contacts display
  }

  // Utility methods
  updatePendingCount() {
    this.pendingMedications = this.todayMedications.filter(med => !med.taken).length;
  }

  refreshData() {
    // Implement data refresh logic
    console.log('Refreshing health data...');
  }
}