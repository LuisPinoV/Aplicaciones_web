import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MedicamentosCardComponent } from 'src/app/compartidos/componentes/medicamentos-card/medicamentos-card.component';
import { AddMedicamentoModalComponent } from 'src/app/compartidos/componentes/add-medicamento-modal/add-medicamento-modal.component';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService, Medicamento } from 'src/app/services/api';

@Component({
  selector: 'app-medicamentos',
  templateUrl: './medicamentos.page.html',
  styleUrls: ['./medicamentos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, MedicamentosCardComponent]
})
export class MedicamentosPage implements OnInit {
  @ViewChild('pageContent', { read: IonContent }) content!: IonContent;
  showScrollTop = false;

  paciente?: Paciente;
  medicamentos: Medicamento[] = [];
  
  initialLoading = true;
  isLoadingMore = false;
  limit = 10;
  offset = 0;
  hasMore = true;

  totalMedicamentos = 0;
  medicamentosRecientes = 0;
  medicamentosActivos = 0;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
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

    window.addEventListener('medicamentoEliminado', (e: any) => {
      const id = e.detail;
      this.medicamentos = this.medicamentos.filter(ex => ex.idMedicamento !== id);
    });
  }

  onMedicamentoDeleted(idConsultaMedicamento: number) {
    this.medicamentos = this.medicamentos.filter(
      ex => ex.idConsultaMedicamento !== idConsultaMedicamento
    );
    this.totalMedicamentos = Math.max(0, this.totalMedicamentos - 1);
  }

  async addMedicamento() {
    const modal = await this.modalController.create({
      component: AddMedicamentoModalComponent,
      cssClass: 'medicamento-modal-dark-border',
      componentProps: {
        paciente: this.paciente
      }
    });

    modal.onDidDismiss().then(async (data) => {
      if (data.data && data.data.nuevoMedicamento) {
        await this.insertarNuevoMedicamento(data.data.nuevoMedicamento);
      }
    });

    return await modal.present();
  }

  private async insertarNuevoMedicamento(nuevoMedicamento: Medicamento) {
    try {
      const medicamentoCompleto: Medicamento = await this.apiService.obtenerMedicamentoPorId(nuevoMedicamento.idConsultaMedicamento);
      
      // Marcar como nuevo para la animación
      medicamentoCompleto._isNew = true;
      this.medicamentos.unshift(medicamentoCompleto);

      // Quitar animación _isNew luego de unos milisegundos
      setTimeout(() => {
        if (this.medicamentos[0]) this.medicamentos[0]._isNew = false;
      }, 800);

      // Actualizar estadísticas desde el servidor
      await this.actualizarEstadisticas();

      this.cdr.detectChanges();
      
      this.showSuccessToast('Medicamento agregado correctamente');
      
    } catch (error) {
      console.error('Error al insertar nuevo medicamento:', error);
      this.showErrorToast('Error al actualizar la lista de medicamentos');
    }
  }

  async actualizarEstadisticas() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      const stats = await this.apiService.getEstadisticasMedicamentos(idFicha);
      
      this.totalMedicamentos = stats.total ?? 0;
      this.medicamentosRecientes = stats.recientes ?? 0;
      this.medicamentosActivos = stats.activos ?? 0;

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    }
  }

  async loadMedicamentos() {
    const idFicha = (this.paciente as any).idFichaMedica;
    const response = await this.apiService.getMedicamentosPaginados(idFicha, 10, 0);
    this.medicamentos = response.data;
    this.totalMedicamentos = this.medicamentos.length;
  }

  ionViewWillEnter() {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.paciente = usuarioGuardado ? JSON.parse(usuarioGuardado) : undefined;
    if (!this.paciente) this.router.navigate(['/login'], { replaceUrl: true });

    if (this.medicamentos.length === 0) {
      this.loadFirstPage();
    }
  }

  private async loadFirstPage() {
    try {
      const idFicha = (this.paciente as any).idFichaMedica || (this.paciente as any).id || (this.paciente as any).Rut;
      
      const [res, stats] = await Promise.all([
        this.apiService.getMedicamentosPaginados(idFicha, this.limit, 0),
        this.apiService.getEstadisticasMedicamentos(idFicha)
      ]);

      this.medicamentos = res.data ?? [];
      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? this.limit;

      this.totalMedicamentos = stats.total ?? 0;
      this.medicamentosRecientes = stats.recientes ?? 0;
      this.medicamentosActivos = stats.activos ?? 0;
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar medicamentos');
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
      const res = await this.apiService.getMedicamentosPaginados(idFicha, this.limit, this.offset);

      const nuevos = res.data ?? [];
      this.medicamentos.push(...nuevos);

      this.hasMore = res.pagination?.hasMore ?? false;
      this.offset = res.pagination?.nextOffset ?? (this.offset + nuevos.length);
    } catch (e) {
      console.error(e);
      this.showErrorToast('Error al cargar más medicamentos');
    } finally {
      this.isLoadingMore = false;
      
      if (event?.target) {
        event.target.complete();
        if (!this.hasMore) event.target.disabled = true;
      }
    }
  }

  trackByMedicamento(index: number, medicamento: Medicamento) {
    return medicamento.idMedicamento || index;
  }

  async sortMedicamentos() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Ordenar por',
      buttons: [
        {
          text: 'Nombre (A-Z)',
          icon: 'arrow-down',
          handler: () => this.sortByName('asc')
        },
        {
          text: 'Nombre (Z-A)',
          icon: 'arrow-up',
          handler: () => this.sortByName('desc')
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

  private sortByName(order: 'asc' | 'desc') {
    this.medicamentos.sort((a, b) => {
      return order === 'asc'
        ? a.nombreMedicamento.localeCompare(b.nombreMedicamento)
        : b.nombreMedicamento.localeCompare(a.nombreMedicamento);
    });

    this.showSuccessToast(
      `Ordenado por nombre ${order === 'asc' ? 'A-Z' : 'Z-A'}`
    );
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
