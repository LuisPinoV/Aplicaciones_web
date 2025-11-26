import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DiagnosticoCardComponent } from 'src/app/compartidos/componentes/diagnostico-card/diagnostico-card.component';
import { AddDiagnosticoModalComponent } from 'src/app/compartidos/componentes/add-diagnostico-modal/add-diagnostico-modal.component';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
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
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
      try {
        this.paciente = JSON.parse(usuarioGuardado) as Paciente;
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
        this.paciente = undefined;
      }
    }

    if (!this.paciente) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }

    window.addEventListener('diagnosticoEliminado', (e: any) => {
      const id = e.detail;
      this.diagnosticos = this.diagnosticos.filter(ex => ex.idDiagnostico !== id);
    });
  }

  onDiagnosticoDeleted(idDiagnostico: number) {
    this.diagnosticos = this.diagnosticos.filter(ex => ex.idDiagnostico !== idDiagnostico);
    
    this.totalDiagnosticos = Math.max(0, this.totalDiagnosticos - 1);
    
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    this.diagnosticosRecientes = this.diagnosticos.filter(
      p => new Date(p.fecha) >= tresMesesAtras
    ).length;

    if (this.totalDiagnosticos === 0) {
      this.diagnosticosActivos = 0;
    }
  }

  async addDiagnostico() {
    const modal = await this.modalController.create({
      component: AddDiagnosticoModalComponent,
      cssClass: 'diagnostico-modal-dark-border',
      componentProps: {
        paciente: this.paciente
      }
    });

    modal.onDidDismiss().then(async (data) => {
      if (data.data && data.data.nuevoDiagnostico) {
        await this.insertarNuevoDiagnostico(data.data.nuevoDiagnostico);
      }
    });

    return await modal.present();
  }

  private async insertarNuevoDiagnostico(nuevoDiagnostico: Diagnostico) {
    try {
      const diagnosticoCompleto: Diagnostico = await this.apiService.obtenerDiagnosticoPorId(nuevoDiagnostico.idDiagnostico);
      
      this.totalDiagnosticos++;
      
      const fechaNuevo = new Date(diagnosticoCompleto.fecha).getTime();
      
      if (this.diagnosticos.length === 0) {
        diagnosticoCompleto._isNew = true;
        this.diagnosticos = [diagnosticoCompleto];
        
        setTimeout(() => {
          if (this.diagnosticos[0]) {
            this.diagnosticos[0]._isNew = false;
          }
        }, 600);
        
        this.actualizarEstadisticas();
        return;
      }

      let posicionCorrecta = -1;
      
      for (let i = 0; i < this.diagnosticos.length; i++) {
        const fechaActual = new Date(this.diagnosticos[i].fecha).getTime();
        if (fechaNuevo >= fechaActual) {
          posicionCorrecta = i;
          break;
        }
      }

      if (posicionCorrecta === -1) {
        posicionCorrecta = this.diagnosticos.length;
      }

      const posicionEnLista = posicionCorrecta + 1;
      
      if (posicionEnLista <= this.offset) {
        
        diagnosticoCompleto._isNew = true;
        
        const nuevoArray = [...this.diagnosticos];
        nuevoArray.splice(posicionCorrecta, 0, diagnosticoCompleto);
        
        if (nuevoArray.length > this.offset) {
          nuevoArray.pop();
        } else {
          this.offset++;
        }
        
        this.diagnosticos = nuevoArray;
        
        setTimeout(() => {
          const diagnostico = this.diagnosticos.find(e => e.idDiagnostico === diagnosticoCompleto.idDiagnostico);
          if (diagnostico) {
            diagnostico._isNew = false;
          }
        }, 600);
        
        this.showSuccessToast('Diagnóstico agregado correctamente');
      } else {
        this.showSuccessToast('Diagnóstico agregado. Desliza hacia abajo para verlo.');
      }
      
      this.actualizarEstadisticas();
      
    } catch (error) {
      console.error('Error al insertar nuevo diagnóstico:', error);
      this.showErrorToast('Error al actualizar la lista de diagnósticos');
    }
  }

  private async actualizarEstadisticas() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      const stats = await this.apiService.getEstadisticasDiagnosticos(idFicha);
      
      this.totalDiagnosticos = stats.total ?? 0;
      this.diagnosticosRecientes = stats.recientes ?? 0;
      this.diagnosticosActivos = stats.activos ?? 0;
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    }
  }

  async loadDiagnosticos() {
    const idFicha = (this.paciente as any).idFichaMedica;
    const response = await this.apiService.getDiagnosticosPaginados(idFicha, 10, 0);
    this.diagnosticos = response.data;
    this.totalDiagnosticos = this.diagnosticos.length;
  }

  ionViewWillEnter() {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.paciente = usuarioGuardado ? JSON.parse(usuarioGuardado) : undefined;
    if (!this.paciente) this.router.navigate(['/login'], { replaceUrl: true });

    if (this.diagnosticos.length === 0) {
      this.loadFirstPage();
    }
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

      const nuevos = res.data ?? [];
      this.diagnosticos.push(...nuevos);

      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? (this.offset + nuevos.length);
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