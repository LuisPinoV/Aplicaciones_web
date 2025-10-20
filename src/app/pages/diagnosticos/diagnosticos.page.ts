import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController, ActionSheetController } from '@ionic/angular';
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
export class DiagnosticosPage {
  @ViewChild('pageContent', { read: IonContent }) content!: IonContent;
  showScrollTop = false;

  paciente?: Paciente;
  diagnosticos: Diagnostico[] = [];
  
  initialLoading = true;
  isLoadingMore = false;
  limit = 10;
  offset = 0;
  hasMore = true;

  totalDiagnosticos = 0;
  diagnosticosRecientes = 0;
  diagnosticosActivos = 0;

  constructor(
    private pacienteStore: PacienteStoreService,
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  async ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();
    
    if (!this.paciente) {
      await new Promise(resolve => setTimeout(resolve, 100));
      this.paciente = this.pacienteStore.getPaciente();
    }
    
    if (!this.paciente) {
      this.router.navigate(['/login']);
      return;
    }
    
    await this.loadFirstPage();
  }

  private async loadFirstPage() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      
      const [res, stats] = await Promise.all([
        this.apiService.getDiagnosticosPaginados(idFicha, this.limit, 0),
        this.apiService.getEstadisticasDiagnosticos(idFicha)
      ]);

      this.diagnosticos = res.data ?? [];
      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? this.limit;

      this.totalDiagnosticos = stats.total ?? 0;
      this.diagnosticosRecientes = stats.recientes ?? 0;
      this.diagnosticosActivos = stats.activos ?? 0;
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar diagnósticos');
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
      const res = await this.apiService.getDiagnosticosPaginados(idFicha, this.limit, this.offset);

      console.log('Respuesta del servidor:', res);
      console.log('Pagination:', res.pagination);

      const nuevos = res.data ?? [];
      this.diagnosticos.push(...nuevos);

      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? (this.offset + nuevos.length);

      console.log('Después de actualizar:', { 
        nuevosLength: nuevos.length,
        totalDiagnosticos: this.diagnosticos.length,
        hasMore: this.hasMore, 
        nextOffset: this.offset 
      });
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar más diagnósticos');
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

  async addDiagnostic() {
    const toast = await this.toastController.create({
      message: 'Abriendo formulario de nuevo diagnóstico...',
      duration: 2000,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
  }

  private sortByDate(order: 'asc' | 'desc') {
    this.diagnosticos.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
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