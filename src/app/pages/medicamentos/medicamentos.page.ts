import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from '../../core/servicios/paciente-store.service';
import { Paciente } from '../../core/servicios/pacientes.service';
import { MedicamentosService, Medicamento } from '../../core/servicios/medicamentos.service';
import { MedicamentosCardComponent } from '../../compartidos/componentes/medicamentos-card/medicamentos-card.component';

@Component({
  selector: 'app-medicamentos',
  templateUrl: './medicamentos.page.html',
  styleUrls: ['./medicamentos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, MedicamentosCardComponent]
})
export class MedicamentosPage implements OnInit {
  paciente?: Paciente;
  medicamentos: Medicamento[] = [];
  isLoading = false;
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private pacienteStore: PacienteStoreService,
    private medicamentosService: MedicamentosService,
    private router: Router,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();

    if (!this.paciente) {
      this.router.navigate(['/buscar']);
      return;
    }

    this.loadMedicamentos();
  }

  private loadMedicamentos() {
    this.isLoading = true;
    
    this.medicamentosService.getPorPaciente(this.paciente!.id).subscribe({
      next: (data) => {
        this.medicamentos = data.sort((a, b) => 
          new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando diagnósticos:', err);
        /*this.showErrorToast('Error al cargar los diagnósticos');*/
        this.isLoading = false;
      }
    });
  }

  getMedicamentosActivos(): number {
    return this.medicamentos.filter(d => d.estado === 'Activo').length;
  }

  getInitials(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  trackByMedicamento(index: number, item: Medicamento): number {
    return item.id;
  }

  async openFilter() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filtrar medicamentos',
      buttons: [
        {
          text: 'Mostrar todos',
          icon: 'list',
          handler: () => {
            this.loadMedicamentos();
          }
        },
        {
          text: 'Solo activos',
          icon: 'pulse',
          handler: () => {
            this.filterActive();
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

  async sortMedicamentos() {
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
          text: 'Nombre (A-Z)',
          icon: 'text',
          handler: () => {
            this.sortByName('asc');
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

  async addMedicamento() {
    const toast = await this.toastController.create({
      message: 'Abriendo formulario de nuevo medicamento...',
      duration: 2000,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
    
    // Aquí implementarías la navegación al formulario de nuevo diagnóstico
    console.log('Navigate to add medicamento form');
  }

  async importMedicamentos() {
    const toast = await this.toastController.create({
      message: 'Función de importación en desarrollo...',
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
    
    console.log('Import medicamentos functionality');
  }

  private filterActive() {
    this.medicamentos = this.medicamentos.filter(d => d.estado === 'Activo');
    this.showSuccessToast(`Mostrando ${this.medicamentos.length} medicamentos activos`);
  }

  private sortByDate(order: 'asc' | 'desc') {
    this.medicamentos.sort((a, b) => {
      const dateA = new Date(a.fechaInicio).getTime();
      const dateB = new Date(b.fechaInicio).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    this.sortOrder = order;
    this.showSuccessToast(`Ordenado por fecha ${order === 'desc' ? 'descendente' : 'ascendente'}`);
  }

  private sortByName(order: 'asc' | 'desc') {
    this.medicamentos.sort((a, b) => {
      const nameA = a.nombre.toLowerCase();
      const nameB = b.nombre.toLowerCase();
      
      if (order === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    
    this.showSuccessToast(`Ordenado alfabéticamente ${order === 'asc' ? 'A-Z' : 'Z-A'}`);
  }

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

  doRefresh(event: any) {
    this.loadMedicamentos();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
