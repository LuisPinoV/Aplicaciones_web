import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-consulta-modal',
  templateUrl: './add-consulta-modal.component.html',
  styleUrls: ['./add-consulta-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddConsultaModalComponent {
  @Input() paciente: any;
  
  descripcion: string = '';
  idMedico: number | null = null;
  institucionMedica: string = '';
  fecha: string = new Date().toISOString();
  maxDate: string = new Date().toISOString();

  medicosDisponibles: any[] = [];
  mostrarInputNuevoMedico: boolean = false;
  nuevoMedicoNombre: string = '';

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarMedicos();
  }

  async cargarMedicos() {
    try {
      this.medicosDisponibles = await this.apiService.obtenerMedicos();
    } catch (error) {
      console.error('Error al cargar médicos:', error);
      const toast = await this.toastController.create({
        message: 'Error al cargar la lista de médicos',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
    }
  }

  onMedicoChange(event: any) {
    const valor = event.detail.value;
    
    if (valor === 'nuevo') {
      this.mostrarInputNuevoMedico = true;
      this.idMedico = null;
    } else {
      this.mostrarInputNuevoMedico = false;
      this.idMedico = valor;
    }
  }

  async guardarConsulta() {
    const idFichaMedica = this.paciente.idFichaMedica;

    try {
      let idMedicoFinal = this.idMedico;

      // Si el usuario eligió crear un nuevo médico
      if (this.mostrarInputNuevoMedico && this.nuevoMedicoNombre.trim()) {
        const nuevoMedico = await this.apiService.crearMedico({ 
          nombre: this.nuevoMedicoNombre.trim() 
        });
        idMedicoFinal = nuevoMedico.idMedico;
      }

      // Validar que tengamos un médico seleccionado o creado
      if (!idMedicoFinal) {
        const toast = await this.toastController.create({
          message: 'Por favor selecciona o crea un médico',
          duration: 2000,
          color: 'warning',
        });
        toast.present();
        return;
      }

      const data = {
        idFichaMedica,
        fecha: this.fecha,
        idMedico: idMedicoFinal,
        institucionMedica: this.institucionMedica,
        descripcion: this.descripcion
      };

      const response = await this.apiService.agregarConsulta(data);
      
      const toast = await this.toastController.create({
        message: 'Consulta agregada correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      this.modalController.dismiss({
        nuevoConsulta: {
          idConsulta: response.idConsulta,
          fecha: this.fecha,
          descripcion: this.descripcion,
          medicoNombre: this.mostrarInputNuevoMedico 
            ? this.nuevoMedicoNombre 
            : this.medicosDisponibles.find(m => m.idMedico === idMedicoFinal)?.nombre
        }
      });
    } catch (error) {
      console.error('Error al agregar consulta:', error);
      const toast = await this.toastController.create({
        message: 'Error al agregar consulta',
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