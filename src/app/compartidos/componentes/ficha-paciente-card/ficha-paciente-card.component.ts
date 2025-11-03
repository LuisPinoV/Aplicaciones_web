import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { ApiService, Paciente } from 'src/app/services/api';

@Component({
  selector: 'app-ficha-paciente-card',
  templateUrl: './ficha-paciente-card.component.html',
  styleUrls: ['./ficha-paciente-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FichaPacienteCardComponent implements OnInit {
  @Input() paciente?: Paciente;
  
  // Estado de edición
  isEditing = false;
  editedPaciente?: Paciente;
  isSaving = false;

  constructor(
    private api: ApiService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    // Cargar datos frescos desde la base de datos
    if (this.paciente?.idUsuario) {
      this.loadPacienteData();
    }
  }

  // Cargar datos desde la base de datos
  async loadPacienteData() {
    if (!this.paciente?.idUsuario) {
      return;
    }

    try {
      const data = await this.api.getPacienteById(this.paciente.idUsuario);
      if (data) {
        // Actualizar directamente las propiedades del paciente
        Object.assign(this.paciente, data);
        
        // También actualizar localStorage
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
          const usuarioLocal = JSON.parse(usuarioGuardado);
          if (usuarioLocal.idUsuario === data.idUsuario) {
          }
        }
      }
    } catch (error) {
      console.error('Error cargando datos del paciente:', error);
    }
  }

  // Modo edición
  startEdit() {
    this.editedPaciente = { ...this.paciente } as Paciente;
    this.isEditing = true;
  }

  cancelEdit() {
    this.editedPaciente = undefined;
    this.isEditing = false;
  }

  async saveEdit() {
    if (!this.editedPaciente || !this.validatePaciente(this.editedPaciente)) {
      await this.showToast('Por favor, verifica los datos ingresados', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar cambios',
      message: '¿Deseas guardar los cambios realizados?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: () => this.performSave()
        }
      ]
    });

    await alert.present();
  }

  private async performSave() {
    this.isSaving = true;

    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Preparar datos para actualizar
      const updateData: Partial<Paciente> = {
        nombre: this.editedPaciente!.nombre,
        Rut: this.editedPaciente!.Rut,
        fechaNacimiento: this.editedPaciente!.fechaNacimiento,
        sexo: this.editedPaciente!.sexo,
        tipoSangre: this.editedPaciente!.tipoSangre,
        telefono: this.editedPaciente!.telefono,
        mail: this.editedPaciente!.mail
      };

      // Guardar en base de datos
      const updated = await this.api.updatePaciente(
        this.editedPaciente!.idUsuario,
        updateData
      );
      
      // Actualizar DIRECTAMENTE las propiedades del paciente (cambio instantáneo)
      if (this.paciente) {
        Object.assign(this.paciente, updated);
      }
      
      // Actualizar localStorage si es el usuario actual
      const usuarioGuardado = localStorage.getItem('usuario');
      if (usuarioGuardado) {
        const usuarioLocal = JSON.parse(usuarioGuardado);
        if (usuarioLocal.idUsuario === updated.idUsuario) {
        }
      }
      
      // Salir del modo edición
      this.isEditing = false;
      this.editedPaciente = undefined;
      
      await loading.dismiss();
      await this.showToast('Cambios guardados exitosamente', 'success');
      
    } catch (error: any) {
      console.error('Error guardando cambios:', error);
      
      await loading.dismiss();
      
      // Manejar errores específicos del backend
      if (error.response?.status === 409) {
        await this.showToast('Ya existe un paciente con este RUT', 'danger');
      } else if (error.response?.status === 404) {
        await this.showToast('Paciente no encontrado', 'danger');
      } else {
        await this.showToast('Error al guardar los cambios. Intenta nuevamente', 'danger');
      }
    } finally {
      this.isSaving = false;
    }
  }

  // Validaciones
  private validatePaciente(paciente: Paciente): boolean {
    if (!paciente.nombre?.trim()) {
      this.showToast('El nombre es obligatorio', 'warning');
      return false;
    }
    if (!paciente.Rut?.trim()) {
      this.showToast('El RUT es obligatorio', 'warning');
      return false;
    }
    if (!paciente.fechaNacimiento) {
      this.showToast('La fecha de nacimiento es obligatoria', 'warning');
      return false;
    }
    if (paciente.mail && !this.isValidEmail(paciente.mail)) {
      this.showToast('El email no tiene un formato válido', 'warning');
      return false;
    }
    if (paciente.telefono && !this.isValidPhone(paciente.telefono)) {
      this.showToast('El teléfono no tiene un formato válido', 'warning');
      return false;
    }
    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Validación básica para números chilenos
    const phoneStr = phone.toString().replace(/\D/g, '');
    return phoneStr.length >= 8 && phoneStr.length <= 11;
  }

  // UI Helpers
  getInitials(nombre?: string): string {
    if (!nombre) return '?';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  get displayAge(): string {
    if (!this.paciente?.fechaNacimiento) return '—';
    
    const birthDate = new Date(this.paciente.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  }

  get displaySex(): string {
    const paciente = this.isEditing ? this.editedPaciente : this.paciente;
    if (!paciente?.sexo) return '—';
    
    const sexo = paciente.sexo.toLowerCase();
    return sexo === 'masculino' || sexo === 'm'
      ? 'Masculino'
      : sexo === 'femenino' || sexo === 'f'
      ? 'Femenino'
      : paciente.sexo;
  }

  get displayBloodType(): string {
    const paciente = this.isEditing ? this.editedPaciente : this.paciente;
    return paciente?.tipoSangre || '—';
  }

  get formattedPhone(): string {
    const paciente = this.isEditing ? this.editedPaciente : this.paciente;
    if (!paciente?.telefono) return '—';
    
    const phone = paciente.telefono.toString().replace(/\D/g, '');
    
    // Formato chileno +56 9 XXXX XXXX
    if (phone.length === 11 && phone.startsWith('569')) {
      return `+56 9 ${phone.slice(3, 7)} ${phone.slice(7)}`;
    }
    if (phone.length === 9 && phone.startsWith('9')) {
      return `+56 9 ${phone.slice(1, 5)} ${phone.slice(5)}`;
    }
    return phone;
  }

  get displayEmail(): string {
    const paciente = this.isEditing ? this.editedPaciente : this.paciente;
    if (!paciente?.mail) return '—';
    
    const email = paciente.mail;
    if (email.length > 25) {
      const [localPart, domain] = email.split('@');
      if (localPart.length > 15) {
        return `${localPart.substring(0, 12)}...@${domain}`;
      }
    }
    return email;
  }

  // Acciones de contacto
  callPhone() {
    if (this.paciente?.telefono) {
      window.open(`tel:${this.paciente.telefono}`, '_system');
    }
  }

  sendEmail() {
    if (this.paciente?.mail) {
      window.open(`mailto:${this.paciente.mail}`, '_system');
    }
  }

  // Toast helper
  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }

  // Opciones para selects
  sexoOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' }
  ];

  bloodTypeOptions = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];
}