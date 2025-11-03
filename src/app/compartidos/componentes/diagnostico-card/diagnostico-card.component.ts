import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Diagnostico } from 'src/app/services/api';

@Component({
  selector: 'app-diagnostico-card',
  templateUrl: './diagnostico-card.component.html',
  styleUrls: ['./diagnostico-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiagnosticoCardComponent {
  @Input() diagnostico!: Diagnostico;
  @Input() index?: number;
  @Output() onDelete = new EventEmitter<number>();

  diagnosticosDisponibles: any[] = [];
  mostrarResultados = false;

  editando = false;
  editable: any = {};
  diagnosticoEliminado = false;
  private diagnosticosDisponiblesCargados = false;

  constructor(
    private api: ApiService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.diagnosticosDisponiblesCargados) {

      this.diagnosticosDisponiblesCargados = true;
    }
    
    if (!this.diagnostico) {
      console.error('Diagnostico no recibido');
      return;
    }

    if (this.diagnostico?.fecha) {
      this.diagnostico.fecha = new Date(this.diagnostico.fecha).toISOString();
    }
    
    this.cdRef.markForCheck();
  }

  getTiempoTranscurrido(): string {
    if (!this.diagnostico?.fecha) return '';
    const fecha = new Date(this.diagnostico.fecha);
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
          text: 'Editar diagnostico',
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
    if (!this.diagnostico) return;

    this.editable = {
      idDiagnostico: this.diagnostico?.idDiagnostico,
      descripcion: this.diagnostico?.descripcion || '',
      fecha: this.diagnostico?.fecha ? this.formatDateForInput(this.diagnostico.fecha) : new Date().toISOString().split('T')[0],
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
    if (!this.diagnostico?.idDiagnostico) return;

    try {
      await this.api.actualizarDiagnostico(this.diagnostico.idDiagnostico, this.editable);

      const diagnosticoActualizado = await this.api.obtenerDiagnosticoPorId(this.diagnostico.idDiagnostico);

      this.diagnostico = diagnosticoActualizado;

      const toast = await this.toastCtrl.create({
        message: 'Diagnóstico actualizado correctamente',
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
        message: 'No se pudo actualizar el diagnóstico.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async confirmarEliminacion() {
    if (!this.diagnostico) {
      console.error('El diagnóstico no está disponible para eliminar');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar diagnostico',
      message: '¿Seguro que deseas eliminar este diagnóstico?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              if (!this.diagnostico!.idDiagnostico) return;

              this.diagnosticoEliminado = true;
              this.cdRef.markForCheck();

              setTimeout(async () => {
                await this.api.eliminarDiagnostico(this.diagnostico!.idDiagnostico);
                
                this.onDelete.emit(this.diagnostico!.idDiagnostico);
                
                const event = new CustomEvent('diagnosticoEliminado', { 
                  detail: this.diagnostico!.idDiagnostico 
                });
                window.dispatchEvent(event);
              }, 0);
            } catch (err) {
              console.error('Error al eliminar diagnóstico:', err);
              this.diagnosticoEliminado = false;
              this.cdRef.markForCheck();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
