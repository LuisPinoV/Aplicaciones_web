import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Alergia } from 'src/app/services/api';

@Component({
  selector: 'app-alergia-card',
  templateUrl: './alergia-card.component.html',
  styleUrls: ['./alergia-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlergiaCardComponent {
  @Input() alergia!: Alergia;
  @Input() index?: number;
  @Output() onDelete = new EventEmitter<number>();

  alergiasDisponibles: any[] = [];
  mostrarResultados = false;

  editando = false;
  editable: any = {};
  alergiaEliminado = false;
  private alergiasDisponiblesCargados = false;

  constructor(
    private api: ApiService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.alergiasDisponiblesCargados) {
      this.alergiasDisponibles = await this.api.obtenerAlergiasDisponibles();
      this.alergiasDisponiblesCargados = true;
    }

    if (this.alergia?.fechaAlergia) {
      this.alergia.fechaAlergia = new Date(this.alergia.fechaAlergia).toISOString();
    }

    this.cdRef.markForCheck();
  }

  getTiempoTranscurrido(): string {
    if (!this.alergia?.fechaAlergia) return '';
    const fecha = new Date(this.alergia.fechaAlergia);
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
          text: 'Editar alergia',
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
    if (!this.alergia) return;

    this.editable = {
      idAlergia: this.alergia?.idAlergia,
      fecha: this.alergia?.fechaAlergia ? this.formatDateForInput(this.alergia.fechaAlergia) : new Date().toISOString().split('T')[0],
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
    if (!this.alergia?.idFichaMedicaAlergia) return;

    try {
      await this.api.actualizarAlergia(this.alergia.idFichaMedicaAlergia, this.editable);

      const alergiaActualizado = await this.api.obtenerAlergiaPorId(this.alergia.idFichaMedicaAlergia);

      this.alergia = alergiaActualizado;

      const toast = await this.toastCtrl.create({
        message: 'Alergia actualizado correctamente',
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
        message: 'No se pudo actualizar el alergia.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async confirmarEliminacion() {
    if (!this.alergia) {
      console.error('El alergia no está disponible para eliminar');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar alergia',
      message: '¿Seguro que deseas eliminar este alergia?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              if (!this.alergia!.idFichaMedicaAlergia) return;

              this.alergiaEliminado = true;
              this.cdRef.markForCheck();

              setTimeout(async () => {
                await this.api.eliminarAlergia(this.alergia!.idFichaMedicaAlergia);
                
                this.onDelete.emit(this.alergia!.idFichaMedicaAlergia);
                
                const event = new CustomEvent('alergiaEliminado', { 
                  detail: this.alergia!.idFichaMedicaAlergia 
                });
                window.dispatchEvent(event);
              }, 0);
            } catch (err) {
              console.error('Error al eliminar alergia:', err);
              this.alergiaEliminado = false;
              this.cdRef.markForCheck();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
