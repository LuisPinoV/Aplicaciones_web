import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { HospitalizacionesService, Hospitalizacion } from 'src/app/core/servicios/hospitalizaciones.service';
import { HospitalizacionCardComponent } from 'src/app/compartidos/componentes/hospitalizacion-card/hospitalizacion-card.component';

@Component({
  selector: 'app-hospitalizaciones',
  templateUrl: './hospitalizaciones.page.html',
  styleUrls: ['./hospitalizaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HospitalizacionCardComponent]
})
export class HospitalizacionesPage implements OnInit {
  paciente?: Paciente;
  hospitalizaciones: Hospitalizacion[] = [];
  isLoading = false;
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private pacienteStore: PacienteStoreService,
    private hospitalizacionesService: HospitalizacionesService,
    private router: Router,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();

    if (!this.paciente) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadHospitalizaciones();
  }

  private loadHospitalizaciones() {
    this.isLoading = true;
    
    this.hospitalizacionesService.getPorPaciente(this.paciente!.id).subscribe({
      next: (data) => {
        this.hospitalizaciones = data.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
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

  getHospitalizacionesRecientes(): number {
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    return this.hospitalizaciones.filter(d => new Date(d.fecha) >= tresMesesAtras).length;
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

  trackByHospitalizacion(index: number, item: Hospitalizacion): number {
    return item.id;
  }

  async openFilter() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filtrar hospitalizaciones',
      buttons: [
        {
          text: 'Mostrar todos',
          icon: 'list',
          handler: () => {
            this.loadHospitalizaciones();
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

  async sortHospitalizaciones() {
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

  async addHospitalizacion() {
    const toast = await this.toastController.create({
      message: 'Abriendo formulario de nueva hospitalización...',
      duration: 2000,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
    
    // Aquí implementarías la navegación al formulario de nuevo diagnóstico
    console.log('Navigate to add hospitalizacion form');
  }

  async importHospitalizaciones() {
    const toast = await this.toastController.create({
      message: 'Función de importación en desarrollo...',
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
    
    console.log('Import hospitalizaciones functionality');
  }

  private filterRecent() {
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    
    this.hospitalizaciones = this.hospitalizaciones.filter(d => 
      new Date(d.fecha) >= tresMesesAtras
    );
    
    this.showSuccessToast(`Mostrando ${this.hospitalizaciones.length} hospitalizaciones recientes`);
  }

  private sortByDate(order: 'asc' | 'desc') {
    this.hospitalizaciones.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    this.sortOrder = order;
    this.showSuccessToast(`Ordenado por fecha ${order === 'desc' ? 'descendente' : 'ascendente'}`);
  }

  private sortByName(order: 'asc' | 'desc') {
    this.hospitalizaciones.sort((a, b) => {
      const nameA = a.institucionMedica.toLowerCase();
      const nameB = b.institucionMedica.toLowerCase();
      
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
    this.loadHospitalizaciones();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
