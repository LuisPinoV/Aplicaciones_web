import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-diagnostico-modal',
  templateUrl: './add-diagnostico-modal.component.html',
  styleUrls: ['./add-diagnostico-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddDiagnosticoModalComponent {
  @Input() paciente: any;
  descripcion: string = '';
  fecha: string = new Date().toISOString();
  maxDate: string = new Date().toISOString();

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
  }

  async guardarDiagnostico() {
    const idFichaMedica = this.paciente.idFichaMedica;
    const data = {
      idFichaMedica,
      fecha: this.fecha,
      descripcion: this.descripcion
    };

    try {
      const response = await this.apiService.agregarDiagnostico(data);
      
      const toast = await this.toastController.create({
        message: 'Diagnóstico agregado correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      this.modalController.dismiss({
        nuevoDiagnostico: {
          idDiagnostico: response.idDiagnostico,
          fecha: this.fecha,
          descripcion: this.descripcion
        }
      });
    } catch (error) {
      console.error('Error al agregar diagnóstico:', error);
      const toast = await this.toastController.create({
        message: 'Error al agregar diagnóstico',
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
