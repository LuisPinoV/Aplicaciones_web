import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ExamenCardComponent } from 'src/app/compartidos/componentes/examen-card/examen-card.component';
import { AddExamenModalComponent } from 'src/app/compartidos/componentes/add-examen-modal/add-examen-modal.component';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService, Examen } from 'src/app/services/api';

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
  examenes: Examen[] = [];
  
  initialLoading = true;
  isLoadingMore = false;
  limit = 10;
  offset = 0;
  hasMore = true;

  totalExamenes = 0;
  examenesRecientes = 0;
  examenesActivos = 0;

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

    window.addEventListener('examenEliminado', (e: any) => {
      const id = e.detail;
      this.examenes = this.examenes.filter(ex => ex.idExamen !== id);
    });
  }

  onExamenDeleted(idExamen: number) {
    this.examenes = this.examenes.filter(ex => ex.idFichaMedicaExamen !== idExamen);
    
    this.totalExamenes = Math.max(0, this.totalExamenes - 1);
    
    if (this.totalExamenes === 0) {
      this.examenesRecientes = 0;
      this.examenesActivos = 0;
    }
  }

  async addExamen() {
    const modal = await this.modalController.create({
      component: AddExamenModalComponent,
      componentProps: {
        paciente: this.paciente
      }
    });

    modal.onDidDismiss().then(async (data) => {
      if (data.data && data.data.nuevoExamen) {
        await this.insertarNuevoExamen(data.data.nuevoExamen);
      }
    });

    return await modal.present();
  }

  private async insertarNuevoExamen(nuevoExamen: Examen) {
    try {
      const examenCompleto: Examen = await this.apiService.obtenerExamenPorId(nuevoExamen.idFichaMedicaExamen);
      
      this.totalExamenes++;
      
      const fechaNuevo = new Date(examenCompleto.fechaExamen).getTime();
      
      if (this.examenes.length === 0) {
        examenCompleto._isNew = true;
        this.examenes = [examenCompleto];
        
        setTimeout(() => {
          if (this.examenes[0]) {
            this.examenes[0]._isNew = false;
          }
        }, 600);
        
        this.actualizarEstadisticas();
        return;
      }

      let posicionCorrecta = -1;
      
      for (let i = 0; i < this.examenes.length; i++) {
        const fechaActual = new Date(this.examenes[i].fechaExamen).getTime();
        if (fechaNuevo >= fechaActual) {
          posicionCorrecta = i;
          break;
        }
      }

      if (posicionCorrecta === -1) {
        posicionCorrecta = this.examenes.length;
      }

      const posicionEnLista = posicionCorrecta + 1;
      
      if (posicionEnLista <= this.offset) {
        
        examenCompleto._isNew = true;
        
        const nuevoArray = [...this.examenes];
        nuevoArray.splice(posicionCorrecta, 0, examenCompleto);
        
        if (nuevoArray.length > this.offset) {
          nuevoArray.pop();
        } else {
          this.offset++;
        }
        
        this.examenes = nuevoArray;
        
        setTimeout(() => {
          const examen = this.examenes.find(e => e.idFichaMedicaExamen === examenCompleto.idFichaMedicaExamen);
          if (examen) {
            examen._isNew = false;
          }
        }, 600);
        
        this.showSuccessToast('Examen agregado correctamente');
      } else {
        this.showSuccessToast('Examen agregado. Desliza hacia abajo para verlo.');
      }
      
      this.actualizarEstadisticas();
      
    } catch (error) {
      console.error('Error al insertar nuevo examen:', error);
      this.showErrorToast('Error al actualizar la lista de exámenes');
    }
  }

  async actualizarEstadisticas() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      const stats = await this.apiService.getEstadisticasExamenes(idFicha);
      
      this.totalExamenes = stats.total ?? 0;
      this.examenesRecientes = stats.recientes ?? 0;
      this.examenesActivos = stats.activos ?? 0;
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    }
  }

  async loadExamenes() {
    const idFicha = (this.paciente as any).idFichaMedica;
    const response = await this.apiService.getExamenesPaginados(idFicha, 10, 0);
    this.examenes = response.data;
    this.totalExamenes = this.examenes.length;
  }

  ionViewWillEnter() {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.paciente = usuarioGuardado ? JSON.parse(usuarioGuardado) : undefined;
    if (!this.paciente) this.router.navigate(['/login'], { replaceUrl: true });

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

  trackByExamen(index: number, examen: Examen) {
    return examen.idFichaMedicaExamen || index;
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