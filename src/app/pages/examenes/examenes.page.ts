import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Examen, ExamenesService } from 'src/app/core/servicios/examenes.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { ExamenCardComponent } from 'src/app/compartidos/componentes/examen-card/examen-card.component';

@Component({
  selector: 'app-examenes',
  templateUrl: './examenes.page.html',
  styleUrls: ['./examenes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ExamenCardComponent]
})
export class ExamenesPage implements OnInit {
  paciente?: Paciente;
  examenes: Examen[] = [];
  isLoading = false;
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private pacienteStore: PacienteStoreService,
    private examenesService: ExamenesService,
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

    this.loadExamenes();
  }

  private loadExamenes() {
    this.isLoading = true;
    
    this.examenesService.getPorPaciente(this.paciente!.id).subscribe({
      next: (data) => {
        this.examenes = data.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando examenes:', err);
        this.showErrorToast('Error al cargar los examenes');
        this.isLoading = false;
      }
    });
  }

  // Funciones para las estadísticas
  getExamenesRecientes(): number {
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    return this.examenes.filter(d => new Date(d.fecha) >= tresMesesAtras).length;
  }

  getExamenesActivos(): number {
    const estadosActivos = ['activo', 'cronico', 'en_tratamiento'];
    return this.examenes.filter(d => d.estado && estadosActivos.includes(d.estado)).length;
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
  trackByExamen(index: number, item: Examen): number {
    return item.id;
  }

  // Nuevos métodos para las acciones
  async openFilter() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filtrar diagnósticos',
      buttons: [
        {
          text: 'Mostrar todos',
          icon: 'list',
          handler: () => {
            this.loadExamenes();
          }
        },
        {
          text: 'Solo recientes (3 meses)',
          icon: 'time',
          handler: () => {
            this.filterRecent();
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

  async sortExamenes() {
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

  async addExamen() {
    const toast = await this.toastController.create({
      message: 'Abriendo formulario de nuevo diagnóstico...',
      duration: 2000,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
    
    // Aquí implementarías la navegación al formulario de nuevo diagnóstico
    console.log('Navigate to add examen form');
  }

  async importExamenes() {
    const toast = await this.toastController.create({
      message: 'Función de importación en desarrollo...',
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
    
    console.log('Import examenes functionality');
  }

  // Métodos de filtrado
  private filterRecent() {
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    
    this.examenes = this.examenes.filter(d => 
      new Date(d.fecha) >= tresMesesAtras
    );
    
    this.showSuccessToast(`Mostrando ${this.examenes.length} examenes recientes`);
  }

  // Métodos de ordenamiento
  private sortByDate(order: 'asc' | 'desc') {
    this.examenes.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    this.sortOrder = order;
    this.showSuccessToast(`Ordenado por fecha ${order === 'desc' ? 'descendente' : 'ascendente'}`);
  }

  private sortByName(order: 'asc' | 'desc') {
    this.examenes.sort((a, b) => {
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
    this.loadExamenes();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
