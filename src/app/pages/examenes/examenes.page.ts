import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { ExamenCardComponent } from 'src/app/compartidos/componentes/examen-card/examen-card.component';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService, ExamenListado } from 'src/app/services/api';

@Component({
  selector: 'app-examenes',
  templateUrl: './examenes.page.html',
  styleUrls: ['./examenes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ExamenCardComponent]
})
export class ExamenesPage {
  @ViewChild('pageContent', { read: IonContent }) content!: IonContent;
  showScrollTop = false;

  paciente?: Paciente;
  examenes: ExamenListado[] = [];
  
  initialLoading = true;
  isLoadingMore = false;
  limit = 10;
  offset = 0;
  hasMore = true;

  totalExamenes = 0;
  examenesRecientes = 0;
  examenesActivos = 0;

  constructor(
    private pacienteStore: PacienteStoreService,
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ionViewWillEnter() {
    this.paciente = this.pacienteStore.getPaciente();
    
    if (!this.paciente) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Solo cargar si no hay datos previos
    if (this.examenes.length === 0) {
      this.loadFirstPage();
    }
  }

  private async loadFirstPage() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      
      const [res, stats] = await Promise.all([
        this.apiService.getExamenesPaginados(idFicha, this.limit, 0),
        this.apiService.getEstadisticasExamenes(idFicha)
      ]);

      this.examenes = res.data ?? [];
      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? this.limit;

      this.totalExamenes = stats.total ?? 0;
      this.examenesRecientes = stats.recientes ?? 0;
      this.examenesActivos = stats.activos ?? 0;
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar exámenes');
    } finally {
      this.initialLoading = false;
    }
  }

  async loadMore(event: any) {
    if (this.isLoadingMore || !this.hasMore) {
      event?.target?.complete();
      return;
    }
    
    this.isLoadingMore = true;

    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      const res = await this.apiService.getExamenesPaginados(idFicha, this.limit, this.offset);

      const nuevos = res.data ?? [];
      this.examenes.push(...nuevos);

      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? (this.offset + nuevos.length);
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar más exámenes');
    } finally {
      this.isLoadingMore = false;
      
      if (event?.target) {
        event.target.complete();
        
        if (!this.hasMore) {
          event.target.disabled = true;
        }
      }
    }
  }

  trackByExamen(index: number, examen: ExamenListado) {
    return examen.idExamen || index;
  }

  async sortExamenes() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Ordenar por',
      buttons: [
        {
          text: 'Fecha (más reciente primero)',
          icon: 'arrow-down',
          handler: () => this.sortByDate('desc')
        },
        {
          text: 'Fecha (más antiguo primero)',
          icon: 'arrow-up',
          handler: () => this.sortByDate('asc')
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
      message: 'Abriendo formulario de nuevo examen...',
      duration: 2000,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
  }

  private sortByDate(order: 'asc' | 'desc') {
    this.examenes.sort((a, b) => {
      const dateA = new Date(a.fechaExamen).getTime();
      const dateB = new Date(b.fechaExamen).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    this.showSuccessToast(`Ordenado por fecha ${order === 'desc' ? 'descendente' : 'ascendente'}`);
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

  onScroll(event: any) {
    this.showScrollTop = event.detail.scrollTop > 1200;
  }

  scrollToTop() {
    this.content.scrollToTop(400);
  }
}