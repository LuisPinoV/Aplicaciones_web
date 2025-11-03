import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-medicamento-modal',
  templateUrl: './add-medicamento-modal.component.html',
  styleUrls: ['./add-medicamento-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddMedicamentoModalComponent implements OnInit {
  @Input() paciente: any; // Debe tener idFichaMedica

  // Listas de selección
  medicamentosDisponibles: any[] = [];
  tiposMedicamentos: any[] = [];
  medicamentosFiltrados: any[] = [];

  // Medicamento seleccionado
  medicamentoSeleccionado: any = null;
  
  // Datos del formulario (ConsultaMedicamento)
  cantidad: number | null = null;
  formato = '';
  tiempoConsumo: number | null = null;
  frecuenciaConsumo = '';

  // Control de UI y filtros
  searchText = '';
  tipoSeleccionado: number | null = null;

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      [this.medicamentosDisponibles, this.tiposMedicamentos] = await Promise.all([
        this.apiService.medicamentosDisponibles(),
        this.apiService.tiposMedicamentos()
      ]);
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      const toast = await this.toastController.create({
        message: 'Error al cargar datos',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  aplicarFiltros() {
    let medicamentos = [...this.medicamentosDisponibles];

    // Filtrar por tipo
    if (this.tipoSeleccionado !== null) {
      medicamentos = medicamentos.filter(med => 
        med.idTipoMedicamento === this.tipoSeleccionado
      );
    }

    // Filtrar por texto de búsqueda
    if (this.searchText.trim() !== '') {
      const query = this.searchText.toLowerCase();
      medicamentos = medicamentos.filter(med =>
        med.nombreMedicamento.toLowerCase().includes(query) ||
        (med.descripcionMedicamento && med.descripcionMedicamento.toLowerCase().includes(query))
      );
    }

    this.medicamentosFiltrados = medicamentos;
  }

  filtrarMedicamentos(event: any) {
    this.searchText = event.detail.value;
    this.aplicarFiltros();
  }

  onTipoChange(event: any) {
    const valor = event.detail.value;
    this.tipoSeleccionado = valor === 'todos' ? null : parseInt(valor);
    this.aplicarFiltros();
  }

  seleccionarMedicamento(medicamento: any) {
    this.medicamentoSeleccionado = medicamento;
  }

  async abrirFormularioNuevo() {
    const alert = await this.alertController.create({
      header: 'Nuevo Medicamento',
      message: 'Ingresa los datos del medicamento que deseas agregar al catálogo',
      inputs: [
        {
          name: 'nombreMedicamento',
          type: 'text',
          placeholder: 'Nombre del medicamento',
          value: this.searchText
        },
        {
          name: 'descripcionMedicamento',
          type: 'textarea',
          placeholder: 'Descripción (opcional)'
        },
        {
          name: 'idTipoMedicamento',
          type: 'number',
          placeholder: 'ID Tipo',
          value: this.tipoSeleccionado || this.tiposMedicamentos[0]?.idTipoMedicamento || 1
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: async (data) => {
            if (!data.nombreMedicamento || data.nombreMedicamento.trim() === '') {
              const toast = await this.toastController.create({
                message: 'El nombre es requerido',
                duration: 2000,
                color: 'warning'
              });
              toast.present();
              return false;
            }
            
            await this.crearNuevoMedicamento(
              data.nombreMedicamento.trim(), 
              data.descripcionMedicamento?.trim(),
              parseInt(data.idTipoMedicamento)
            );
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async crearNuevoMedicamento(nombreMedicamento: string, descripcionMedicamento?: string, idTipoMedicamento?: number) {
    try {
      const nuevoMed = await this.apiService.crearNuevoMedicamento({
        nombreMedicamento,
        descripcionMedicamento: descripcionMedicamento || '',
        idTipoMedicamento: idTipoMedicamento || this.tiposMedicamentos[0]?.idTipoMedicamento || 1
      });

      // Recargar lista y seleccionar el nuevo
      await this.cargarDatos();
      
      const medCreado = this.medicamentosDisponibles.find(m => 
        m.idMedicamento === nuevoMed.idMedicamento
      );
      
      if (medCreado) {
        this.seleccionarMedicamento(medCreado);
      }

      const toast = await this.toastController.create({
        message: 'Medicamento agregado al catálogo',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      console.error('Error al crear medicamento:', error);
      const toast = await this.toastController.create({
        message: 'Error al crear medicamento',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  limpiarSeleccion() {
    this.medicamentoSeleccionado = null;
  }

  limpiarFiltros() {
    this.searchText = '';
    this.tipoSeleccionado = null;
    this.aplicarFiltros();
  }

  async guardarMedicamento() {
    try {
      if (!this.medicamentoSeleccionado) {
        const toast = await this.toastController.create({
          message: 'Debes seleccionar un medicamento',
          duration: 2000,
          color: 'warning'
        });
        toast.present();
        return;
      }

      const data = {
        idFichaMedica: this.paciente.idFichaMedica,
        idMedicamento: this.medicamentoSeleccionado.idMedicamento,
        cantidad: this.cantidad ?? 0,
        formato: this.formato,
        tiempoConsumo: this.tiempoConsumo ?? 0,
        frecuenciaConsumo: this.frecuenciaConsumo
      };

      const response = await this.apiService.agregarMedicamento(data);

      const toast = await this.toastController.create({
        message: 'Medicamento agregado correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      this.modalController.dismiss({
        nuevoMedicamento: {
          ...response,
          nombreMedicamento: this.medicamentoSeleccionado.nombreMedicamento,
          tipoMedicamento: this.medicamentoSeleccionado.tipoMedicamento,
          descripcionMedicamento: this.medicamentoSeleccionado.descripcionMedicamento
        }
      });
    } catch (error) {
      console.error('Error al agregar medicamento:', error);
      const toast = await this.toastController.create({
        message: 'Error al agregar medicamento',
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