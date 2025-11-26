import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Medicamento } from 'src/app/services/api';

@Component({
  selector: 'app-medicamentos-card',
  templateUrl: './medicamentos-card.component.html',
  styleUrls: ['./medicamentos-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicamentosCardComponent {
  @Input() medicamento!: Medicamento;
  @Input() index?: number;
  @Output() onDelete = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<void>();

  editando = false;
  editable: Medicamento = { ...this.medicamento };
  medicamentoEliminado = false;

  constructor(
    private api: ApiService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdRef: ChangeDetectorRef
  ) {}

  async abrirOpciones() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar medicamento',
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
    this.editable = { ...this.medicamento };
    this.editando = true;
    this.cdRef.markForCheck();
  }

  cancelarEdicion() {
    this.editando = false;
    this.cdRef.markForCheck();
  }

  async guardarCambios() {
    try {
      await this.api.actualizarMedicamento(this.medicamento.idConsultaMedicamento, this.editable);
      this.medicamento = { ...this.editable };

      const toast = await this.toastCtrl.create({
        message: 'Medicamento actualizado correctamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();

      this.onEdit.emit();
      this.editando = false;
      this.cdRef.markForCheck();

    } catch (err) {
      console.error('Error al guardar cambios:', err);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo actualizar el medicamento.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async confirmarEliminacion() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar medicamento',
      message: '¿Seguro que deseas eliminar este medicamento?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              this.medicamentoEliminado = true;
              this.cdRef.markForCheck();

              setTimeout(async () => {
                await this.api.eliminarMedicamento(this.medicamento.idConsultaMedicamento);
                this.onDelete.emit(this.medicamento.idConsultaMedicamento);

                const toast = await this.toastCtrl.create({
                  message: 'Medicamento eliminado correctamente',
                  duration: 1500,
                  color: 'success'
                });
                toast.present();
              }, 200);
            } catch (err) {
              console.error('Error al eliminar:', err);
              this.medicamentoEliminado = false;
              this.cdRef.markForCheck();

              const toast = await this.toastCtrl.create({
                message: 'Error al eliminar medicamento',
                duration: 2000,
                color: 'danger'
              });
              toast.present();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
