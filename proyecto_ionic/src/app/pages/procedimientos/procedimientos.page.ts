import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProcedimientosCardComponent } from 'src/app/compartidos/componentes/procedimientos-card/procedimientos-card.component';
import { AddProcedimientoModalComponent } from 'src/app/compartidos/componentes/add-procedimiento-modal/add-procedimiento-modal.component';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService, Procedimiento } from 'src/app/services/api';

@Component({
  selector: 'app-procedimientos',
  templateUrl: './procedimientos.page.html',
  styleUrls: ['./procedimientos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ProcedimientosCardComponent]
})
export class ProcedimientosPage {
  @ViewChild('pageContent', { read: IonContent }) content!: IonContent;
    showScrollTop = false;
  
    paciente?: Paciente;
    procedimientos: Procedimiento[] = [];
    
    initialLoading = true;
    isLoadingMore = false;
    limit = 10;
    offset = 0;
    hasMore = true;
  
    totalProcedimientos = 0;
    procedimientosRecientes = 0;
    procedimientosActivos = 0;
  
    constructor(
      private router: Router,
      private apiService: ApiService,
      private toastController: ToastController,
      private actionSheetController: ActionSheetController,
      private modalController: ModalController,
      private cdRef: ChangeDetectorRef
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
  
      window.addEventListener('procedimientoEliminado', (e: any) => {
        const id = e.detail;
        this.procedimientos = this.procedimientos.filter(ex => ex.idFichaMedicaCirujia !== id);
      });
    }
  
    onProcedimientoDeleted(idFichaMedicaCirujia: number) {
      this.procedimientos = this.procedimientos.filter(
        ex => ex.idFichaMedicaCirujia !== idFichaMedicaCirujia
      );

      this.totalProcedimientos = Math.max(0, this.totalProcedimientos - 1);

      const tresMesesAtras = new Date();
      tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

      this.procedimientosRecientes = this.procedimientos.filter(
        p => new Date(p.fecha) >= tresMesesAtras
      ).length;

      if (this.totalProcedimientos === 0) {
        this.procedimientosActivos = 0;
      }
    }
  
    async addProcedimiento() {
      const modal = await this.modalController.create({
        component: AddProcedimientoModalComponent,
        cssClass: 'procedimiento-modal-dark-border',
        componentProps: {
          paciente: this.paciente
        }
      });
  
      modal.onDidDismiss().then(async (data) => {
        if (data.data && data.data.nuevoProcedimiento) {
          await this.insertarNuevoProcedimiento(data.data.nuevoProcedimiento);
        }
      });
  
      return await modal.present();
    }
  
    private async insertarNuevoProcedimiento(nuevoProcedimiento: Procedimiento) {
      try {
        const procedimientoC: Procedimiento = await this.apiService.obtenerProcedimientoPorId(nuevoProcedimiento.idFichaMedicaCirujia);
        
        const procedimientoCompleto = { ...procedimientoC };

        this.totalProcedimientos++;
        
        const fechaNuevo = new Date(procedimientoCompleto.fecha).getTime();
        
        if (this.procedimientos.length === 0) {
          procedimientoCompleto._isNew = true;
          this.procedimientos = [procedimientoCompleto];
          
          setTimeout(() => {
            if (this.procedimientos[0]) {
              this.procedimientos[0]._isNew = false;
            }
          }, 600);
          
          this.actualizarEstadisticas();
          return;
        }
  
        let posicionCorrecta = -1;
        
        for (let i = 0; i < this.procedimientos.length; i++) {
          const fechaActual = new Date(this.procedimientos[i].fecha).getTime();
          if (fechaNuevo >= fechaActual) {
            posicionCorrecta = i;
            break;
          }
        }
  
        if (posicionCorrecta === -1) {
          posicionCorrecta = this.procedimientos.length;
        }
  
        const posicionEnLista = posicionCorrecta + 1;
        
        if (posicionEnLista <= this.offset) {
          
          procedimientoCompleto._isNew = true;
          
          const nuevoArray = [...this.procedimientos];
          nuevoArray.splice(posicionCorrecta, 0, procedimientoCompleto);
          
          if (nuevoArray.length > this.offset) {
            nuevoArray.pop();
          } else {
            this.offset++;
          }
          
          this.procedimientos = nuevoArray;

          this.procedimientos = [...this.procedimientos];
          
          setTimeout(() => {
            const procedimiento = this.procedimientos.find(e => e.idFichaMedicaCirujia === procedimientoCompleto.idFichaMedicaCirujia);
            if (procedimiento) {
              procedimiento._isNew = false;
            }
          }, 600);

          this.cdRef.detectChanges();
          
          this.showSuccessToast('Procedimiento agregado correctamente');
        } else {
          this.showSuccessToast('Procedimiento agregado. Desliza hacia abajo para verlo.');
        }
        
        this.actualizarEstadisticas();
        
      } catch (error) {
        console.error('Error al insertar nuevo procedimiento:', error);
        this.showErrorToast('Error al actualizar la lista de procedimientos');
      }
    }
  
    async actualizarEstadisticas() {
      try {
        const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
        const stats = await this.apiService.getEstadisticasProcedimientos(idFicha);
        
        this.totalProcedimientos = stats.total ?? 0;
        this.procedimientosRecientes = stats.recientes ?? 0;
        this.procedimientosActivos = stats.activos ?? 0;
      } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
      }
    }
  
    async loadProcedimientos() {
      const idFicha = (this.paciente as any).idFichaMedica;
      const response = await this.apiService.getProcedimientosPaginados(idFicha, 10, 0);
      this.procedimientos = response.data;
      this.totalProcedimientos = this.procedimientos.length;
    }
  
    ionViewWillEnter() {
      const usuarioGuardado = localStorage.getItem('usuario');
      this.paciente = usuarioGuardado ? JSON.parse(usuarioGuardado) : undefined;
      if (!this.paciente) this.router.navigate(['/login'], { replaceUrl: true });
  
      if (this.procedimientos.length === 0) {
        this.loadFirstPage();
      }
    }
  
    private async loadFirstPage() {
      try {
        const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
        
        const [res, stats] = await Promise.all([
          this.apiService.getProcedimientosPaginados(idFicha, this.limit, 0),
          this.apiService.getEstadisticasProcedimientos(idFicha)
        ]);
  
        this.procedimientos = res.data ?? [];
        this.hasMore = res.pagination?.hasMore ?? false;
        this.offset = res.pagination?.nextOffset ?? this.limit;
  
        this.totalProcedimientos = stats.total ?? 0;
        this.procedimientosRecientes = stats.recientes ?? 0;
        this.procedimientosActivos = stats.activos ?? 0;
      } catch (e) {
        console.error(e);
        this.showErrorToast('Error al cargar procedimientos');
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
        const res = await this.apiService.getProcedimientosPaginados(idFicha, this.limit, this.offset);
  
        const nuevos = res.data ?? [];
        this.procedimientos.push(...nuevos);
  
        this.hasMore = res.pagination?.hasMore ?? false;
        this.offset = res.pagination?.nextOffset ?? (this.offset + nuevos.length);
      } catch (e) {
        console.error(e);
        this.showErrorToast('Error al cargar más procedimientos');
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
  
    trackByProcedimiento(index: number, procedimiento: Procedimiento) {
      return procedimiento.idFichaMedicaCirujia || index;
    }
  
    async sortProcedimientos() {
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
      this.procedimientos.sort((a, b) => {
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
