import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlergiaCardComponent } from 'src/app/compartidos/componentes/alergia-card/alergia-card.component';
import { AddAlergiaModalComponent } from 'src/app/compartidos/componentes/add-alergia-modal/add-alergia-modal.component';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService, Alergia } from 'src/app/services/api';

@Component({
  selector: 'app-alergias',
  templateUrl: './alergias.page.html',
  styleUrls: ['./alergias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AlergiaCardComponent]
})
export class AlergiasPage implements OnInit {
  @ViewChild('pageContent', { read: IonContent }) content!: IonContent;
  showScrollTop = false;

  paciente?: Paciente;
  alergias: Alergia[] = [];
  
  initialLoading = true;
  isLoadingMore = false;
  limit = 10;
  offset = 0;
  hasMore = true;

  totalAlergias = 0;
  alergiasRecientes = 0;
  alergiasActivos = 0;

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

    window.addEventListener('alergiaEliminado', (e: any) => {
      const id = e.detail;
      this.alergias = this.alergias.filter(ex => ex.idFichaMedicaAlergia !== id);
    });
  }

  onAlergiaDeleted(idFichaMedicaAlergia: number) {
    this.alergias = this.alergias.filter(ex => ex.idFichaMedicaAlergia !== idFichaMedicaAlergia);
    
    this.totalAlergias = Math.max(0, this.totalAlergias - 1);
    
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    this.alergiasRecientes = this.alergias.filter(
      p => new Date(p.fechaAlergia) >= tresMesesAtras
    ).length;

    if (this.totalAlergias === 0) {
      this.alergiasActivos = 0;
    }
  }

  async addAlergia() {
    const modal = await this.modalController.create({
      component: AddAlergiaModalComponent,
      cssClass: 'alergia-modal-dark-border',
      componentProps: {
        paciente: this.paciente
      }
    });

    modal.onDidDismiss().then(async (data) => {
      if (data.data && data.data.nuevoAlergia) {
        await this.insertarNuevoAlergia(data.data.nuevoAlergia);
      }
    });

    return await modal.present();
  }

  private async insertarNuevoAlergia(nuevoAlergia: Alergia) {
    try {
      const alergiaCompleto: Alergia = await this.apiService.obtenerAlergiaPorId(nuevoAlergia.idFichaMedicaAlergia);
      
      this.totalAlergias++;
      
      const fechaNuevo = new Date(alergiaCompleto.fechaAlergia).getTime();
      
      if (this.alergias.length === 0) {
        alergiaCompleto._isNew = true;
        this.alergias = [alergiaCompleto];
        
        setTimeout(() => {
          if (this.alergias[0]) {
            this.alergias[0]._isNew = false;
          }
        }, 600);
        
        this.actualizarEstadisticas();
        return;
      }

      let posicionCorrecta = -1;
      
      for (let i = 0; i < this.alergias.length; i++) {
        const fechaActual = new Date(this.alergias[i].fechaAlergia).getTime();
        if (fechaNuevo >= fechaActual) {
          posicionCorrecta = i;
          break;
        }
      }

      if (posicionCorrecta === -1) {
        posicionCorrecta = this.alergias.length;
      }

      const posicionEnLista = posicionCorrecta + 1;
      
      if (posicionEnLista <= this.offset) {
        
        alergiaCompleto._isNew = true;
        
        const nuevoArray = [...this.alergias];
        nuevoArray.splice(posicionCorrecta, 0, alergiaCompleto);
        
        if (nuevoArray.length > this.offset) {
          nuevoArray.pop();
        } else {
          this.offset++;
        }
        
        this.alergias = nuevoArray;
        
        setTimeout(() => {
          const alergia = this.alergias.find(e => e.idFichaMedicaAlergia === alergiaCompleto.idFichaMedicaAlergia);
          if (alergia) {
            alergia._isNew = false;
          }
        }, 600);
        
        this.showSuccessToast('Alergia agregado correctamente');
      } else {
        this.showSuccessToast('Alergia agregado. Desliza hacia abajo para verlo.');
      }
      
      this.actualizarEstadisticas();
      
    } catch (error) {
      console.error('Error al insertar nuevo alergia:', error);
      this.showErrorToast('Error al actualizar la lista de alergias');
    }
  }

  private async actualizarEstadisticas() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      const stats = await this.apiService.getEstadisticasAlergias(idFicha);
      
      this.totalAlergias = stats.total ?? 0;
      this.alergiasRecientes = stats.recientes ?? 0;
      this.alergiasActivos = stats.activos ?? 0;
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    }
  }

  async loadAlergias() {
    const idFicha = (this.paciente as any).idFichaMedica;
    const response = await this.apiService.getAlergiasPaginados(idFicha, 10, 0);
    this.alergias = response.data;
    this.totalAlergias = this.alergias.length;
  }

  ionViewWillEnter() {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.paciente = usuarioGuardado ? JSON.parse(usuarioGuardado) : undefined;
    if (!this.paciente) this.router.navigate(['/login'], { replaceUrl: true });

    if (this.alergias.length === 0) {
      this.loadFirstPage();
    }
  }

  private async loadFirstPage() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      
      const [res, stats] = await Promise.all([
        this.apiService.getAlergiasPaginados(idFicha, this.limit, 0),
        this.apiService.getEstadisticasAlergias(idFicha)
      ]);

      this.alergias = res.data ?? [];
      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? this.limit;

      this.totalAlergias = stats.total ?? 0;
      this.alergiasRecientes = stats.recientes ?? 0;
      this.alergiasActivos = stats.activos ?? 0;
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar alergias');
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
      const res = await this.apiService.getAlergiasPaginados(idFicha, this.limit, this.offset);

      const nuevos = res.data ?? [];
      this.alergias.push(...nuevos);

      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? (this.offset + nuevos.length);
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar más alergias');
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

  trackByAlergia(index: number, alergia: Alergia) {
    return alergia.idFichaMedicaAlergia || index;
  }

  async sortAlergias() {
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
    this.alergias.sort((a, b) => {
      const dateA = new Date(a.fechaAlergia).getTime();
      const dateB = new Date(b.fechaAlergia).getTime();
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