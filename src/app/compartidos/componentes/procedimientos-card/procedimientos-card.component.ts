import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Procedimiento } from 'src/app/services/api';

@Component({
  selector: 'app-procedimientos-card',
  templateUrl: './procedimientos-card.component.html',
  styleUrls: ['./procedimientos-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedimientosCardComponent implements OnInit {
  @Input() procedimiento?: Procedimiento;
  @Input() index?: number;
  @Output() onDelete = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<void>();
  
  procedimientosDisponibles: any[] = [];

  editando = false;
  editable: any = {};
  procedimientoEliminado = false;
  private procedimientosDisponiblesCargados = false;

  constructor(
    private api: ApiService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.procedimientosDisponiblesCargados) {
      this.procedimientosDisponibles = await this.api.obtenerProcedimientosDisponibles();
      this.procedimientosDisponiblesCargados = true;
    }
    
    if (!this.procedimiento) {
      console.error('Procedimiento no recibido');
      return;
    }

    if (this.procedimiento?.idFichaMedicaCirujia) {
      this.api.obtenerProcedimientoPorId(this.procedimiento.idFichaMedicaCirujia)
    }

    if (this.procedimiento?.fecha) {
      this.procedimiento.fecha = new Date(this.procedimiento.fecha).toISOString();
    }
    
    this.cdRef.markForCheck();
  }

  getTiempoTranscurrido(): string {
    if (!this.procedimiento?.fecha) return '';
    const fecha = new Date(this.procedimiento.fecha);
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

  async abrirOpciones() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar procedimiento',
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
    if (!this.procedimiento) return;

    this.editable = {
      idCirujia: this.procedimiento?.idCirujia,
      descripcion: this.procedimiento?.descripcion || '',
      fecha: this.procedimiento?.fecha
        ? this.formatDateForInput(this.procedimiento.fecha)
        : new Date().toISOString().split('T')[0],
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
    if (!this.procedimiento?.idFichaMedicaCirujia) return;

    try {
      const datosActualizados = {
        ...this.editable,
      };

      await this.api.actualizarProcedimiento(this.procedimiento.idFichaMedicaCirujia, datosActualizados);

      const procedimientoActualizado = await this.api.obtenerProcedimientoPorId(this.procedimiento.idFichaMedicaCirujia);
      this.procedimiento = { ...procedimientoActualizado };

      const toast = await this.toastCtrl.create({
        message: 'Procedimiento actualizado correctamente',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.onEdit.emit();

      this.editando = false;
      this.cdRef.detectChanges();
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo actualizar el procedimiento.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async confirmarEliminacion() {
    if (!this.procedimiento) {
      console.error('El procedimiento no está disponible para eliminar');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar procedimiento',
      message: '¿Seguro que deseas eliminar este procedimiento?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              if (!this.procedimiento!.idFichaMedicaCirujia) return;

              this.procedimientoEliminado = true;
              this.cdRef.markForCheck();

              setTimeout(async () => {
                await this.api.eliminarProcedimiento(this.procedimiento!.idFichaMedicaCirujia);
                
                this.onDelete.emit(this.procedimiento!.idFichaMedicaCirujia);
                
                const event = new CustomEvent('procedimientoEliminado', { 
                  detail: this.procedimiento!.idFichaMedicaCirujia
                });
                window.dispatchEvent(event);
              }, 0);
            } catch (err) {
              console.error('Error al eliminar procedimiento:', err);
              this.procedimientoEliminado = false;
              this.cdRef.markForCheck();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}