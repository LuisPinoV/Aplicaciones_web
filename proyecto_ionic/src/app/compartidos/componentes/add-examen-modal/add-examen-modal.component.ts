import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ApiService, Examen, ResultadoEsperado } from 'src/app/services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-examen-modal',
  templateUrl: './add-examen-modal.component.html',
  styleUrls: ['./add-examen-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddExamenModalComponent {
  @Input() paciente: any;
  examenSeleccionado: Examen | undefined;
  resultadosEsperados: ResultadoEsperado[] = [];
  resultados: any[] = [];
  descripcion: string = '';
  fechaExamen: string = new Date().toISOString();
  maxDate: string = new Date().toISOString();
  examenesDisponibles: any[] = [];

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.examenesDisponibles = await this.apiService.obtenerExamenesDisponibles();
  }

  // Cargar los resultados esperados para el examen seleccionado
  async loadResultadosEsperados() {
    if (!this.examenSeleccionado) return;

    try {
      const response = await this.apiService.getResultadosEsperadosByExamen(this.examenSeleccionado.idExamen);
      this.resultadosEsperados = response;
      this.resultados = this.resultadosEsperados.map(result => ({
        idResultadoEsperado: result.idResultadoEsperado,
        nombre: result.nombre,
        valor: '',
        formato: result.formato || 'mg/dL'
      }));
    } catch (error) {
      console.error('Error al cargar resultados esperados:', error);
      const toast = await this.toastController.create({
        message: 'Error al cargar los resultados esperados',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  // Guardar el examen con los resultados
  async guardarExamen() {
    if (!this.examenSeleccionado) {
      const toast = await this.toastController.create({
        message: 'Debe seleccionar un examen',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    // Validar que los resultados tengan valores
    const resultadosIncompletos = this.resultados.some(r => !r.valor || r.valor === '');
    if (resultadosIncompletos) {
      const toast = await this.toastController.create({
        message: 'Debe completar todos los resultados',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    const idFichaMedica = this.paciente.idFichaMedica;
    const data = {
      idFichaMedica,
      idExamen: this.examenSeleccionado.idExamen,
      fechaExamen: this.fechaExamen,
      descripcionFicha: this.descripcion,
      resultados: this.resultados
    };

    try {
      // Crear el examen y obtener la respuesta
      const response = await this.apiService.agregarExamen(data);
      
      const toast = await this.toastController.create({
        message: 'Examen agregado correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      // Cerrar el modal y retornar el examen creado
      this.modalController.dismiss({
        nuevoExamen: {
          idFichaMedicaExamen: response.idFichaMedicaExamen || response.id,
          fechaExamen: this.fechaExamen,
          idExamen: this.examenSeleccionado.idExamen,
          nombreExamen: this.examenSeleccionado.nombreExamen,
          descripcionExamen: this.examenSeleccionado.descripcionExamen,
          descripcionFicha: this.descripcion,
          resultados: this.resultados
        }
      });
    } catch (error) {
      console.error('Error al agregar examen:', error);
      const toast = await this.toastController.create({
        message: 'Error al agregar examen',
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