import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Hospitalizacion } from 'src/app/services/api';

@Component({
  selector: 'app-hospitalizacion-card',
  templateUrl: './hospitalizacion-card.component.html',
  styleUrls: ['./hospitalizacion-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HospitalizacionCardComponent {
  @Input() hospitalizacion!: Hospitalizacion;
  @Input() index?: number;
  @Output() onDelete = new EventEmitter<number>();

  hospitalizacionesDisponibles: any[] = [];
  mostrarResultados = false;

  editando = false;
  editable: any = {};
  hospitalizacionEliminado = false;
  private hospitalizacionesDisponiblesCargados = false;

  constructor(
    private api: ApiService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.hospitalizacionesDisponiblesCargados) {

      this.hospitalizacionesDisponiblesCargados = true;
    }
    
    if (!this.hospitalizacion) {
      console.error('Hospitalización no recibida');
      return;
    }

    if (this.hospitalizacion?.fecha) {
      this.hospitalizacion.fecha = new Date(this.hospitalizacion.fecha).toISOString();
    }
    
    this.cdRef.markForCheck();
  }

  getTiempoTranscurrido(): string {
    if (!this.hospitalizacion?.fecha) return '';
    const fecha = new Date(this.hospitalizacion.fecha);
    const hoy = new Date();
    const diff = hoy.getTime() - fecha.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);
    if (años > 0) return `Hace ${años} año${años > 1 ? 's' : ''}`;
    if (meses > 0) return `Hace ${meses} mes${meses > 1 ? 'es' : ''}`;
    if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    return 'Hoy';
  }

  formatDateForInput(date: string): string {
    const formattedDate = new Date(date);
    return formattedDate.toISOString().split('T')[0];
  }

  // Toggle para mostrar/ocultar resultados
  toggleResultados() {
    this.mostrarResultados = !this.mostrarResultados;
    this.cdRef.markForCheck();
  }

  async abrirOpciones() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar hospitalizacion',
          icon: 'create-outline',
          handler: () => this.iniciarEdicion(),
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => this.confirmarEliminacion(),
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });
    await sheet.present();
  }

  iniciarEdicion() {
    if (!this.hospitalizacion) return;

    this.editable = {
      idHospitalizacion: this.hospitalizacion?.idHospitalizacion,
      institucionMedica: this.hospitalizacion?.institucionMedica || '',
      duracion: this.hospitalizacion?.duracion || '',
      fecha: this.hospitalizacion?.fecha ? this.formatDateForInput(this.hospitalizacion.fecha) : new Date().toISOString().split('T')[0],
    };

    this.editando = true;

    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 50);
  }

  cancelarEdicion() {
    this.editando = false;
    this.cdRef.markForCheck();
  }

  async guardarCambios() {
    if (!this.hospitalizacion?.idHospitalizacion) return;

    try {
      await this.api.actualizarHospitalizacion(this.hospitalizacion.idHospitalizacion, this.editable);

      const hospitalizacionActualizado = await this.api.obtenerHospitalizacionPorId(this.hospitalizacion.idHospitalizacion);

      this.hospitalizacion = hospitalizacionActualizado;

      const toast = await this.toastCtrl.create({
        message: 'Hospitalización actualizada correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      this.editando = false;
      this.cdRef.markForCheck();
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo actualizar el hospitalización.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async confirmarEliminacion() {
    if (!this.hospitalizacion) {
      console.error('El hospitalización no está disponible para eliminar');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar hospitalizacion',
      message: '¿Seguro que deseas eliminar este hospitalización?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              if (!this.hospitalizacion!.idHospitalizacion) return;

              this.hospitalizacionEliminado = true;
              this.cdRef.markForCheck();

              setTimeout(async () => {
                await this.api.eliminarHospitalizacion(this.hospitalizacion!.idHospitalizacion);
                
                this.onDelete.emit(this.hospitalizacion!.idHospitalizacion);
                
                const event = new CustomEvent('hospitalizacionEliminado', { 
                  detail: this.hospitalizacion!.idHospitalizacion 
                });
                window.dispatchEvent(event);
              }, 0);
            } catch (err) {
              console.error('Error al eliminar hospitalización:', err);
              this.hospitalizacionEliminado = false;
              this.cdRef.markForCheck();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
