import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HospitalizacionCardComponent } from 'src/app/compartidos/componentes/hospitalizacion-card/hospitalizacion-card.component';
import { AddHospitalizacionModalComponent } from 'src/app/compartidos/componentes/add-hospitalizacion-modal/add-hospitalizacion-modal.component';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService, Hospitalizacion } from 'src/app/services/api';

@Component({
  selector: 'app-hospitalizaciones',
  templateUrl: './hospitalizaciones.page.html',
  styleUrls: ['./hospitalizaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HospitalizacionCardComponent]
})
export class HospitalizacionesPage {
  @ViewChild('pageContent', { read: IonContent }) content!: IonContent;
  showScrollTop = false;

  paciente?: Paciente;
  hospitalizaciones: Hospitalizacion[] = [];
  
  initialLoading = true;
  isLoadingMore = false;
  limit = 10;
  offset = 0;
  hasMore = true;

  totalHospitalizaciones = 0;
  hospitalizacionesRecientes = 0;
  hospitalizacionesActivos = 0;

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

    window.addEventListener('hospitalizacionEliminado', (e: any) => {
      const id = e.detail;
      this.hospitalizaciones = this.hospitalizaciones.filter(ex => ex.idHospitalizacion !== id);
    });
  }

  onHospitalizacionDeleted(idHospitalizacion: number) {
    this.hospitalizaciones = this.hospitalizaciones.filter(ex => ex.idHospitalizacion !== idHospitalizacion);
    
    this.totalHospitalizaciones = Math.max(0, this.totalHospitalizaciones - 1);
    
    if (this.totalHospitalizaciones === 0) {
      this.hospitalizacionesRecientes = 0;
      this.hospitalizacionesActivos = 0;
    }
  }

  async addHospitalizacion() {
    const modal = await this.modalController.create({
      component: AddHospitalizacionModalComponent,
      componentProps: {
        paciente: this.paciente
      }
    });

    modal.onDidDismiss().then(async (data) => {
      if (data.data && data.data.nuevoHospitalizacion) {
        await this.insertarNuevoHospitalizacion(data.data.nuevoHospitalizacion);
      }
    });

    return await modal.present();
  }

  private async insertarNuevoHospitalizacion(nuevoHospitalizacion: Hospitalizacion) {
    try {
      const hospitalizacionCompleto: Hospitalizacion = await this.apiService.obtenerHospitalizacionPorId(nuevoHospitalizacion.idHospitalizacion);
      
      this.totalHospitalizaciones++;
      
      const fechaNuevo = new Date(hospitalizacionCompleto.fecha).getTime();
      
      if (this.hospitalizaciones.length === 0) {
        hospitalizacionCompleto._isNew = true;
        this.hospitalizaciones = [hospitalizacionCompleto];
        
        setTimeout(() => {
          if (this.hospitalizaciones[0]) {
            this.hospitalizaciones[0]._isNew = false;
          }
        }, 600);
        
        this.actualizarEstadisticas();
        return;
      }

      let posicionCorrecta = -1;
      
      for (let i = 0; i < this.hospitalizaciones.length; i++) {
        const fechaActual = new Date(this.hospitalizaciones[i].fecha).getTime();
        if (fechaNuevo >= fechaActual) {
          posicionCorrecta = i;
          break;
        }
      }

      if (posicionCorrecta === -1) {
        posicionCorrecta = this.hospitalizaciones.length;
      }

      const posicionEnLista = posicionCorrecta + 1;
      
      if (posicionEnLista <= this.offset) {
        
        hospitalizacionCompleto._isNew = true;
        
        const nuevoArray = [...this.hospitalizaciones];
        nuevoArray.splice(posicionCorrecta, 0, hospitalizacionCompleto);
        
        if (nuevoArray.length > this.offset) {
          nuevoArray.pop();
        } else {
          this.offset++;
        }
        
        this.hospitalizaciones = nuevoArray;
        
        setTimeout(() => {
          const hospitalizacion = this.hospitalizaciones.find(e => e.idHospitalizacion === hospitalizacionCompleto.idHospitalizacion);
          if (hospitalizacion) {
            hospitalizacion._isNew = false;
          }
        }, 600);
        
        this.showSuccessToast('Hospitalizacion agregado correctamente');
      } else {
        this.showSuccessToast('Hospitalizacion agregado. Desliza hacia abajo para verlo.');
      }
      
      this.actualizarEstadisticas();
      
    } catch (error) {
      console.error('Error al insertar nuevo hospitalizacion:', error);
      this.showErrorToast('Error al actualizar la lista de exámenes');
    }
  }

  private async actualizarEstadisticas() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      const stats = await this.apiService.getEstadisticasHospitalizaciones(idFicha);
      
      this.totalHospitalizaciones = stats.total ?? 0;
      this.hospitalizacionesRecientes = stats.recientes ?? 0;
      this.hospitalizacionesActivos = stats.activos ?? 0;
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    }
  }

  async loadHospitalizaciones() {
    const idFicha = (this.paciente as any).idFichaMedica;
    const response = await this.apiService.getHospitalizacionesPaginados(idFicha, 10, 0);
    this.hospitalizaciones = response.data;
    this.totalHospitalizaciones = this.hospitalizaciones.length;
  }

  ionViewWillEnter() {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.paciente = usuarioGuardado ? JSON.parse(usuarioGuardado) : undefined;
    if (!this.paciente) this.router.navigate(['/login'], { replaceUrl: true });

    if (this.hospitalizaciones.length === 0) {
      this.loadFirstPage();
    }
  }

  private async loadFirstPage() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      
      const [res, stats] = await Promise.all([
        this.apiService.getHospitalizacionesPaginados(idFicha, this.limit, 0),
        this.apiService.getEstadisticasHospitalizaciones(idFicha)
      ]);

      this.hospitalizaciones = res.data ?? [];
      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? this.limit;

      this.totalHospitalizaciones = stats.total ?? 0;
      this.hospitalizacionesRecientes = stats.recientes ?? 0;
      this.hospitalizacionesActivos = stats.activos ?? 0;
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar hospitalizaciones');
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
      const res = await this.apiService.getHospitalizacionesPaginados(idFicha, this.limit, this.offset);

      const nuevos = res.data ?? [];
      this.hospitalizaciones.push(...nuevos);

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

  trackByHospitalizacion(index: number, hospitalizacion: Hospitalizacion) {
    return hospitalizacion.idHospitalizacion || index;
  }

  async sortHospitalizaciones() {
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
    this.hospitalizaciones.sort((a, b) => {
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