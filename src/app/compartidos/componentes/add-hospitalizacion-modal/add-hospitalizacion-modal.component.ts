import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-hospitalizacion-modal',
  templateUrl: './add-hospitalizacion-modal.component.html',
  styleUrls: ['./add-hospitalizacion-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddHospitalizacionModalComponent implements OnInit {
  @Input() paciente: any;
  
  duracion: number = 1; // Cambiado de Int16Array a number
  institucionMedica: string = "";
  fecha: string = new Date().toISOString();
  maxDate: string = new Date().toISOString();

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Inicialización si es necesaria
  }

  // Validación del formulario
  formularioValido(): boolean {
    return this.institucionMedica.trim().length > 0 && 
           this.duracion > 0 && 
           this.fecha.length > 0;
  }

  async guardarHospitalizacion() {
    if (!this.formularioValido()) {
      const toast = await this.toastController.create({
        message: 'Por favor complete todos los campos correctamente',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    const idFichaMedica = this.paciente.idFichaMedica;
    
    // Formatear la fecha antes de enviar (solo la fecha, sin hora)
    const fechaFormateada = new Date(this.fecha).toISOString().split('T')[0];
    
    const data = {
      idFichaMedica,
      fecha: fechaFormateada,
      duracion: Number(this.duracion), // Asegurar que sea número
      institucionMedica: this.institucionMedica.trim()
    };

    try {
      const response = await this.apiService.agregarHospitalizacion(data);
      
      const toast = await this.toastController.create({
        message: 'Hospitalización agregada correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      this.modalController.dismiss({
        nuevoHospitalizacion: {
          idHospitalizacion: response.idHospitalizacion,
          fecha: fechaFormateada,
          duracion: this.duracion,
          institucionMedica: this.institucionMedica.trim()
        }
      });
    } catch (error) {
      console.error('Error al agregar hospitalización:', error);
      const toast = await this.toastController.create({
        message: 'Error al agregar hospitalización. Intente nuevamente.',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  cancelar() {
    this.modalController.dismiss();
  }
}