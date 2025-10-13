import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { DiagnosticoCardComponent } from 'src/app/compartidos/componentes/diagnostico-card/diagnostico-card.component';
import { ApiService, Diagnostico } from 'src/app/services/api';

@Component({
  selector: 'app-diagnosticos',
  templateUrl: './diagnosticos.page.html',
  styleUrls: ['./diagnosticos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, DiagnosticoCardComponent]
})
export class DiagnosticosPage implements OnInit {
  paciente?: Paciente;
  diagnosticos: Diagnostico[] = [];
  isLoading = false;
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private pacienteStore: PacienteStoreService,
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();

    if (!this.paciente) {
      this.router.navigate(['/buscar']);
      return;
    }
    this.loadDiagnosticos();
  }

  private async loadDiagnosticos() {
    this.isLoading = true;
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      this.diagnosticos = await this.apiService.getDiagnosticosPorFicha(idFicha);
    } catch (err) {
      console.error('Error cargando diagnósticos:', err);
    } finally {
      this.isLoading = false;
    }
  }

  // Funciones para las estadísticas
  getDiagnosticosRecientes(): number {
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    return this.diagnosticos.filter(d => new Date(d.fecha) >= tresMesesAtras).length;
  }

  getDiagnosticosActivos(): number {
    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
    return this.diagnosticos.filter(d => new Date(d.fecha) >= unAnoAtras).length;
  }

  // Función para generar iniciales del paciente
  getInitials(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Función para optimizar el renderizado de la lista
  trackByDiagnostico(index: number, diagnostico: Diagnostico) {
    return diagnostico.idDiagnostico || index;
  }

  async sortDiagnostics() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Ordenar por',
      buttons: [
        {
          text: 'Fecha (más reciente primero)',
          icon: 'arrow-down',
          handler: () => {
            this.sortByDate('desc');
          }
        },
        {
          text: 'Fecha (más antiguo primero)',
          icon: 'arrow-up',
          handler: () => {
            this.sortByDate('asc');
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async addDiagnostic() {
    const toast = await this.toastController.create({
      message: 'Abriendo formulario de nuevo diagnóstico...',
      duration: 2000,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
    
    // Aquí implementarías la navegación al formulario de nuevo diagnóstico
    console.log('Navigate to add diagnostic form');
  }

  async importDiagnostics() {
    const toast = await this.toastController.create({
      message: 'Función de importación en desarrollo...',
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
    
    console.log('Import diagnostics functionality');
  }

  // Métodos de ordenamiento
  private sortByDate(order: 'asc' | 'desc') {
    this.diagnosticos.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    this.sortOrder = order;
    this.showSuccessToast(`Ordenado por fecha ${order === 'desc' ? 'descendente' : 'ascendente'}`);
  }

  // Métodos de utilidad para toasts
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  // Método para refrescar datos
  doRefresh(event: any) {
    this.loadDiagnosticos();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}