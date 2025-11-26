import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ConsultasCardComponent } from 'src/app/compartidos/componentes/consultas-card/consultas-card.component';
import { AddConsultaModalComponent } from 'src/app/compartidos/componentes/add-consulta-modal/add-consulta-modal.component';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService, Consulta } from 'src/app/services/api';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ConsultasCardComponent]
})
export class ConsultasPage {
  @ViewChild('pageContent', { read: IonContent }) content!: IonContent;
  showScrollTop = false;

  paciente?: Paciente;
  consultas: Consulta[] = [];
  
  initialLoading = true;
  isLoadingMore = false;
  limit = 10;
  offset = 0;
  hasMore = true;

  totalConsultas = 0;
  consultasRecientes = 0;
  consultasActivos = 0;

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

    window.addEventListener('consultaEliminado', (e: any) => {
      const id = e.detail;
      this.consultas = this.consultas.filter(ex => ex.idConsulta !== id);
    });
  }

  onConsultaDeleted(idConsulta: number) {
    this.consultas = this.consultas.filter(ex => ex.idConsulta !== idConsulta);
    
    this.totalConsultas = Math.max(0, this.totalConsultas - 1);

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    this.consultasRecientes = this.consultas.filter(
      p => new Date(p.fecha) >= tresMesesAtras
    ).length;

    if (this.totalConsultas === 0) {
      this.consultasActivos = 0;
    }
  }

  async addConsulta() {
    const modal = await this.modalController.create({
      component: AddConsultaModalComponent,
      cssClass: 'consulta-modal-dark-border',
      componentProps: {
        paciente: this.paciente
      }
    });

    modal.onDidDismiss().then(async (data) => {
      if (data.data && data.data.nuevoConsulta) {
        await this.insertarNuevoConsulta(data.data.nuevoConsulta);
      }
    });

    return await modal.present();
  }

  private async insertarNuevoConsulta(nuevoConsulta: Consulta) {
    try {
      const consultaCompleto: Consulta = await this.apiService.obtenerConsultaPorId(nuevoConsulta.idConsulta);
      
      this.totalConsultas++;
      
      const fechaNuevo = new Date(consultaCompleto.fecha).getTime();
      
      if (this.consultas.length === 0) {
        consultaCompleto._isNew = true;
        this.consultas = [consultaCompleto];
        
        setTimeout(() => {
          if (this.consultas[0]) {
            this.consultas[0]._isNew = false;
          }
        }, 0);
        
        this.actualizarEstadisticas();
        return;
      }

      let posicionCorrecta = -1;
      
      for (let i = 0; i < this.consultas.length; i++) {
        const fechaActual = new Date(this.consultas[i].fecha).getTime();
        if (fechaNuevo >= fechaActual) {
          posicionCorrecta = i;
          break;
        }
      }

      if (posicionCorrecta === -1) {
        posicionCorrecta = this.consultas.length;
      }

      const posicionEnLista = posicionCorrecta + 1;
      
      if (posicionEnLista <= this.offset) {
        
        consultaCompleto._isNew = true;
        
        const nuevoArray = [...this.consultas];
        nuevoArray.splice(posicionCorrecta, 0, consultaCompleto);
        
        if (nuevoArray.length > this.offset) {
          nuevoArray.pop();
        } else {
          this.offset++;
        }
        
        this.consultas = nuevoArray;
        
        setTimeout(() => {
          const consulta = this.consultas.find(e => e.idConsulta === consultaCompleto.idConsulta);
          if (consulta) {
            consulta._isNew = false;
          }
        }, 0);
        
        this.showSuccessToast('Consulta agregado correctamente');
      } else {
        this.showSuccessToast('Consulta agregado. Desliza hacia abajo para verlo.');
      }
      
      this.actualizarEstadisticas();
      
    } catch (error) {
      console.error('Error al insertar nuevo consulta:', error);
      this.showErrorToast('Error al actualizar la lista de consultas');
    }
  }

  async actualizarEstadisticas() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      const stats = await this.apiService.getEstadisticasConsultas(idFicha);
      
      this.totalConsultas = stats.total ?? 0;
      this.consultasRecientes = stats.recientes ?? 0;
      this.consultasActivos = stats.activos ?? 0;
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    }
  }

  async loadConsultas() {
    const idFicha = (this.paciente as any).idFichaMedica;
    const response = await this.apiService.getConsultasPaginados(idFicha, 10, 0);
    this.consultas = response.data;
    this.totalConsultas = this.consultas.length;
  }

  ionViewWillEnter() {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.paciente = usuarioGuardado ? JSON.parse(usuarioGuardado) : undefined;
    if (!this.paciente) this.router.navigate(['/login'], { replaceUrl: true });

    if (this.consultas.length === 0) {
      this.loadFirstPage();
    }
  }

  private async loadFirstPage() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      
      const [res, stats] = await Promise.all([
        this.apiService.getConsultasPaginados(idFicha, this.limit, 0),
        this.apiService.getEstadisticasConsultas(idFicha)
      ]);

      this.consultas = res.data ?? [];
      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? this.limit;

      this.totalConsultas = stats.total ?? 0;
      this.consultasRecientes = stats.recientes ?? 0;
      this.consultasActivos = stats.activos ?? 0;
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar consultas');
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
      const res = await this.apiService.getConsultasPaginados(idFicha, this.limit, this.offset);

      const nuevos = res.data ?? [];
      this.consultas.push(...nuevos);

      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? (this.offset + nuevos.length);
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar más consultas');
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

  trackByConsulta(index: number, consulta: Consulta) {
    return consulta.idConsulta || index;
  }

  async sortConsultas() {
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
    this.consultas.sort((a, b) => {
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
