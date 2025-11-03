import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-alergia-modal',
  templateUrl: './add-alergia-modal.component.html',
  styleUrls: ['./add-alergia-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddAlergiaModalComponent {
  @Input() paciente: any;

  fechaAlergia: string = new Date().toISOString();
  maxDate: string = new Date().toISOString();
  idAlergiaSeleccionada: number | null = null;
  alergiasDisponibles: any[] = [];

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    try {
      this.alergiasDisponibles = await this.apiService.obtenerAlergiasDisponibles();
    } catch (error) {
      console.error('Error al cargar alergias disponibles:', error);
    }
  }

  async guardarAlergia() {
    if (!this.idAlergiaSeleccionada || !this.paciente?.idFichaMedica) return;

    const data = {
      idFichaMedica: this.paciente.idFichaMedica,
      idAlergia: this.idAlergiaSeleccionada,
      fecha: this.fechaAlergia
    };

    try {
      // Este endpoint debe devolver idFichaMedicaAlergia
      const response = await this.apiService.agregarAlergia(data);

      const toast = await this.toastController.create({
        message: 'Alergia agregada correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      // Emitimos la data al padre
      this.modalController.dismiss({
        nuevoAlergia: {
          idFichaMedicaAlergia: response.idFichaMedicaAlergia,
          idAlergia: this.idAlergiaSeleccionada,
          fechaAlergia: this.fechaAlergia
        }
      });
    } catch (error) {
      console.error('Error al agregar alergia:', error);
      const toast = await this.toastController.create({
        message: 'Error al agregar alergia',
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
