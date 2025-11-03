import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ApiService, Procedimiento } from 'src/app/services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-procedimiento-modal',
  templateUrl: './add-procedimiento-modal.component.html',
  styleUrls: ['./add-procedimiento-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddProcedimientoModalComponent {
  @Input() paciente: any;
  procedimientoSeleccionado: Procedimiento | undefined;
  descripcion: string = '';
  fecha: string = new Date().toISOString();
  maxDate: string = new Date().toISOString();
  procedimientosDisponibles: any[] = [];

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.procedimientosDisponibles = await this.apiService.obtenerProcedimientosDisponibles();
  }
  
  async guardarProcedimiento() {
    if (!this.procedimientoSeleccionado) {
      const toast = await this.toastController.create({
        message: 'Debe seleccionar un procedimiento',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    const idFichaMedica = this.paciente.idFichaMedica;
    const data = {
      idFichaMedica,
      idCirujia: this.procedimientoSeleccionado.idCirujia,
      fecha: this.fecha,
      descripcion: this.descripcion
    };

    try {
      // Crear el procedimiento y obtener la respuesta
      const response = await this.apiService.agregarProcedimiento(data);
      
      const toast = await this.toastController.create({
        message: 'Procedimiento agregado correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      // Cerrar el modal y retornar el procedimiento creado
      this.modalController.dismiss({
        nuevoProcedimiento: {
          idFichaMedicaCirujia: response.idFichaMedicaCirujia || response.id,
          fecha: this.fecha,
          idCirujia: this.procedimientoSeleccionado.idCirujia,
          nombreCirujia: this.procedimientoSeleccionado.nombreCirujia,
          descripcionCirujia: this.procedimientoSeleccionado.descripcionCirujia,
          descripcion: this.descripcion
        }
      });
    } catch (error) {
      console.error('Error al agregar procedimiento:', error);
      const toast = await this.toastController.create({
        message: 'Error al agregar procedimiento',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  // Cerrar el modal sin guardar
  cancelar() {
    this.modalController.dismiss();
  }
}
