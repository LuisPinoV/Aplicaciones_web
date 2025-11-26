import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Consulta } from 'src/app/services/api';

@Component({
  selector: 'app-consultas-card',
  templateUrl: './consultas-card.component.html',
  styleUrls: ['./consultas-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultasCardComponent implements OnInit {
  @Input() consulta!: Consulta;
  @Input() index?: number;
  @Output() onDelete = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<void>();

  medicosDisponibles: any[] = [];
  mostrarResultados = false;
  medicoSeleccionado: any = null;
  mostrarInputNuevoMedico = false;
  nuevoMedicoNombre = '';

  editando = false;
  editable: any = {};
  consultaEliminado = false;
  private medicosDisponiblesCargados = false;

  constructor(
    private api: ApiService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.consulta) {
      console.error('Consulta no recibido');
      return;
    }

    if (this.consulta?.fecha) {
      this.consulta.fecha = new Date(this.consulta.fecha).toISOString();
    }
    
    this.cdRef.markForCheck();
  }

  async cargarMedicos() {
    if (this.medicosDisponiblesCargados) return;

    try {
      // Asume que tienes un endpoint para obtener médicos
      this.medicosDisponibles = await this.api.obtenerMedicos();
      this.medicosDisponiblesCargados = true;
      this.cdRef.markForCheck();
    } catch (err) {
      console.error('Error al cargar médicos:', err);
    }
  }

  getTiempoTranscurrido(): string {
    if (!this.consulta?.fecha) return '';
    const fecha = new Date(this.consulta.fecha);
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

  toggleResultados() {
    this.mostrarResultados = !this.mostrarResultados;
    this.cdRef.markForCheck();
  }

  async abrirOpciones() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar consulta',
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

  async iniciarEdicion() {
    if (!this.consulta) return;

    // Cargar médicos disponibles
    await this.cargarMedicos();

    // Buscar si el médico actual está en la lista
    this.medicoSeleccionado = this.medicosDisponibles.find(
      m => m.nombre === this.consulta.medicoNombre
    )?.idMedico || null;

    this.editable = {
      idConsulta: this.consulta?.idConsulta,
      idMedico: this.medicoSeleccionado,
      institucionMedica: this.consulta?.institucionMedica || '',
      descripcion: this.consulta?.descripcion || '',
      fecha: this.consulta?.fecha ? this.formatDateForInput(this.consulta.fecha) : new Date().toISOString().split('T')[0],
    };

    this.editando = true;
    this.mostrarInputNuevoMedico = false;
    this.nuevoMedicoNombre = '';

    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 50);
  }

  onMedicoChange(event: any) {
    const valor = event.detail.value;
    
    if (valor === 'nuevo') {
      this.mostrarInputNuevoMedico = true;
      this.editable.idMedico = null;
    } else {
      this.mostrarInputNuevoMedico = false;
      this.editable.idMedico = valor;
    }
    
    this.cdRef.markForCheck();
  }

  cancelarEdicion() {
    this.editando = false;
    this.mostrarInputNuevoMedico = false;
    this.nuevoMedicoNombre = '';
    this.cdRef.markForCheck();
  }

  async guardarCambios() {
    if (!this.consulta?.idConsulta) return;

    try {
      let idMedicoFinal = this.editable.idMedico;

      // Si el usuario eligió crear un nuevo médico
      if (this.mostrarInputNuevoMedico && this.nuevoMedicoNombre.trim()) {
        const nuevoMedico = await this.api.crearMedico({ 
          nombre: this.nuevoMedicoNombre.trim() 
        });
        idMedicoFinal = nuevoMedico.idMedico;
      }

      // Actualizar la consulta con el idMedico
      await this.api.actualizarConsulta(this.consulta.idConsulta, {
        fecha: this.editable.fecha,
        idMedico: idMedicoFinal,
        institucionMedica: this.editable.institucionMedica,
        descripcion: this.editable.descripcion
      });

      const consultaActualizado = await this.api.obtenerConsultaPorId(this.consulta.idConsulta);

      this.consulta = consultaActualizado;

      const toast = await this.toastCtrl.create({
        message: 'Consulta actualizada correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      this.onEdit.emit();

      this.editando = false;
      this.mostrarInputNuevoMedico = false;
      this.nuevoMedicoNombre = '';
      this.medicosDisponiblesCargados = false;
      this.cdRef.markForCheck();
      
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo actualizar la consulta.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async confirmarEliminacion() {
    if (!this.consulta) {
      console.error('La consulta no está disponible para eliminar');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar consulta',
      message: '¿Seguro que deseas eliminar esta consulta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              if (!this.consulta!.idConsulta) return;

              this.consultaEliminado = true;
              this.cdRef.markForCheck();

              setTimeout(async () => {
                await this.api.eliminarConsulta(this.consulta!.idConsulta);
                
                this.onDelete.emit(this.consulta!.idConsulta);
                
                const event = new CustomEvent('consultaEliminado', { 
                  detail: this.consulta!.idConsulta 
                });
                window.dispatchEvent(event);
              }, 0);
            } catch (err) {
              console.error('Error al eliminar consulta:', err);
              this.consultaEliminado = false;
              this.cdRef.markForCheck();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}