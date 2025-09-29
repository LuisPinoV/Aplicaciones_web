import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

interface Medication {
  id: number;
  name: string;
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
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab3Page implements OnInit {
  paciente?: Paciente;
  fichaNombre: string = '';
  pendingMedications: number = 0;
  activeMedications: number = 0;
  monthlyExams: number = 0;

  todayMedications: Medication[] = [];
  recentActivities: Activity[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private pacienteStore: PacienteStoreService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();
    if (!this.paciente) {
      this.router.navigate(['/login']);
    }
    await this.cargarFicha();
  }

  // ================== Carga de datos desde backend ==================
  async cargarFicha() {
    try {
      const fichaCompleta = await this.api.getFichaCompleta(1); // idFichaMedica = 1
      this.fichaNombre = fichaCompleta.ficha.nombre;

      // Obtener medicamentos
      const meds = await this.api.getMedicamentosFicha(1);
      this.todayMedications = meds.map((m: any) => ({
        id: m.idMedicamento,
        name: m.nombre
      }));

      // Contadores
      this.pendingMedications = this.todayMedications.length;
      this.activeMedications = this.todayMedications.length;

      // contador examenes 
      const procedimientos = await this.api.getProcedimientosFicha(1);
      this.monthlyExams = procedimientos.filter(
        (p: any) => p.idTipoProcedimiento === 2
      ).length;

      // Mapear actividad reciente (opcional, puedes personalizar)
      this.recentActivities = [
        ...fichaCompleta.diagnosticos.map((d: any) => ({
          id: d.idDiagnostico,
          title: `Diagnóstico: ${d.descripcion}`,
          time: new Date(d.fecha).toLocaleDateString(),
          type: 'exam',
          icon: 'document-text'
        })),
        ...fichaCompleta.consultas.map((c: any) => ({
          id: c.idConsulta,
          title: `Consulta: ${c.descripcion || 'Realizada'}`,
          time: new Date(c.fecha).toLocaleDateString(),
          type: 'medication',
          icon: 'medical'
        }))
      ];
    } catch (error) {
      console.error('Error al cargar la ficha:', error);
    }
  }

  // ================== Medicamentos ==================
  async markAsTaken(medication: Medication) {
    medication.taken = true;
    this.pendingMedications = this.todayMedications.filter(m => !m.taken).length;

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
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Omitir',
          handler: () => {
            medication.taken = true;
            this.pendingMedications = this.todayMedications.filter(m => !m.taken).length;
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

  // ================== Navegación ==================
  viewAllMedications() {
    this.router.navigate(['/tabs/historial/medicamentos']);
  }

  viewHistory() {
    console.log('Navegar al historial de actividad');
  }

  // ================== Acciones rápidas ==================
  async addMedication() {
    const toast = await this.toastController.create({
      message: 'Abriendo formulario de medicamentos...',
      duration: 1500,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
    console.log('Navegar a agregar medicamento');
  }

  async addExam() {
    const toast = await this.toastController.create({
      message: 'Abriendo cámara/galería...',
      duration: 1500,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
    console.log('Subir examen');
  }

  async scheduleAppointment() {
    const toast = await this.toastController.create({
      message: 'Abriendo calendario...',
      duration: 1500,
      color: 'secondary',
      position: 'bottom'
    });
    await toast.present();
    console.log('Agendar cita');
  }

  async emergency() {
    const alert = await this.alertController.create({
      header: 'Emergencia Médica',
      message: '¿Necesitas contactar servicios de emergencia?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Llamar 911', handler: () => this.callEmergency() },
        { text: 'Contactos de emergencia', handler: () => this.showEmergencyContacts() }
      ]
    });
    await alert.present();
  }

  private callEmergency() {
    console.log('Llamando a emergencias');
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
    console.log('Mostrar contactos de emergencia');
  }
}
