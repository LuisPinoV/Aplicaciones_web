import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api';

export interface Paciente {
  idUsuario: number;
  nombre: string;
  Rut: string;
  fechaNacimiento: string;
  sexo: string;
  tipoSangre: string;
}

interface FormData {
  idUsuario?: number;
  nombre: string;
  Rut: string;
  fechaNacimiento: string;
  sexo: string;
  tipoSangre: string;
}

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditarPerfilPage implements OnInit {
  paciente?: Paciente;
  formData: FormData = {
    nombre: '',
    Rut: '',
    fechaNacimiento: '',
    sexo: '',
    tipoSangre: ''
  };
  originalData: FormData = {
    nombre: '',
    Rut: '',
    fechaNacimiento: '',
    sexo: '',
    tipoSangre: ''
  };
  isLoading = false;

  // Fecha máxima (hoy) para el datepicker
  maxDate: string = new Date().toISOString();
  
  // Fecha mínima (hace 120 años)
  minDate: string = new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString();

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private api: ApiService
  ) {}

  async ngOnInit() {
    await this.cargarDatosPaciente();
  }

  async ionViewWillEnter() {
    await this.cargarDatosPaciente();
  }

  // Cargar datos actuales del paciente desde la API
  private async cargarDatosPaciente() {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      console.error('No se encontraron datos del paciente en localStorage');
      await this.showToast('No se encontraron datos del usuario', 'danger');
      this.router.navigate(['/tabs/perfil']);
      return;
    }

    try {
      const usuarioTemp = JSON.parse(usuarioGuardado);
      const idUsuario = usuarioTemp.idUsuario;

      if (!idUsuario) {
        throw new Error('ID de usuario no encontrado');
      }

      // Mostrar loading
      const loading = await this.loadingController.create({
        message: 'Cargando datos...',
        spinner: 'crescent'
      });
      await loading.present();

      // Obtener datos actualizados desde la API
      this.paciente = await this.api.getPacienteById(idUsuario);

      // Formatear la fecha para el ion-datetime (ISO format)
      const fechaFormateada = this.paciente.fechaNacimiento 
        ? new Date(this.paciente.fechaNacimiento).toISOString()
        : '';

      // Crear copia de los datos originales
      this.originalData = {
        idUsuario: this.paciente.idUsuario,
        nombre: this.paciente.nombre || '',
        Rut: this.formatearRut(this.paciente.Rut.toString()),
        fechaNacimiento: fechaFormateada,
        sexo: this.paciente.sexo || '',
        tipoSangre: this.paciente.tipoSangre || ''
      };
      
      // Crear copia para el formulario
      this.formData = { ...this.originalData };

      await loading.dismiss();
      
    } catch (error) {
      console.error('Error al cargar datos del paciente:', error);
      await this.showToast('Error al cargar datos del usuario', 'danger');
      this.router.navigate(['/tabs/perfil']);
    }
  }

  // Formatear RUT chileno
  private formatearRut(rut: string): string {
    // Eliminar puntos y guión
    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
    
    if (rutLimpio.length < 2) return rut;

    // Separar número y dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);

    // Formatear con puntos
    let rutFormateado = '';
    let contador = 0;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      rutFormateado = cuerpo[i] + rutFormateado;
      contador++;
      if (contador === 3 && i !== 0) {
        rutFormateado = '.' + rutFormateado;
        contador = 0;
      }
    }

    return `${rutFormateado}-${dv}`;
  }

  // Obtener iniciales para el avatar
  getInitials(): string {
    if (!this.formData.nombre) return '?';
    return this.formData.nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Cambiar avatar (placeholder)
  async cambiarAvatar() {
    const alert = await this.alertController.create({
      header: 'Cambiar Foto',
      message: 'Esta funcionalidad estará disponible próximamente.',
      buttons: ['OK']
    });
    await alert.present();
  }

  // Validar formulario
  private validarFormulario(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.formData.nombre?.trim()) {
      errors.push('El nombre es obligatorio');
    }

    if (!this.formData.fechaNacimiento) {
      errors.push('La fecha de nacimiento es obligatoria');
    } else {
      const edad = this.calcularEdad(this.formData.fechaNacimiento);
      if (edad < 0 || edad > 120) {
        errors.push('La fecha de nacimiento no es válida');
      }
    }

    if (!this.formData.sexo) {
      errors.push('Debe seleccionar el sexo');
    }

    if (!this.formData.tipoSangre) {
      errors.push('Debe seleccionar el tipo de sangre');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calcular edad desde fecha de nacimiento
  private calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  // Verificar si hay cambios
  private hayCambios(): boolean {
    return JSON.stringify(this.formData) !== JSON.stringify(this.originalData);
  }

  // Guardar cambios
  async guardarCambios() {
    // Validar formulario
    const validation = this.validarFormulario();
    if (!validation.isValid) {
      await this.showToast(validation.errors[0], 'danger');
      return;
    }

    // Verificar si hay cambios
    if (!this.hayCambios()) {
      await this.showToast('No hay cambios para guardar', 'warning');
      return;
    }

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    try {
      const idUsuario = this.formData.idUsuario!;
      
      // Preparar datos a enviar
      const datosActualizar: Partial<Paciente> = {
        nombre: this.formData.nombre,
        fechaNacimiento: this.formData.fechaNacimiento,
        sexo: this.formData.sexo,
        tipoSangre: this.formData.tipoSangre
      };

      // Actualizar en la base de datos
      const pacienteActualizado = await this.api.updatePaciente(idUsuario, datosActualizar);
      

      // Marcar que se guardaron cambios para recargar en tab5
      localStorage.setItem('perfilActualizado', 'true');

      await loading.dismiss();
      
      // Mostrar éxito
      await this.showToast('Perfil actualizado correctamente', 'success');
      
      // Pequeña pausa para que el usuario vea el mensaje
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Regresar a la pantalla de perfil
      await this.router.navigate(['/tabs/perfil']);

    } catch (error: any) {
      await loading.dismiss();
      console.error('Error al guardar:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Error al guardar los cambios';
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  // Cancelar edición
  async cancelarEdicion() {
    if (this.hayCambios()) {
      const alert = await this.alertController.create({
        header: 'Descartar Cambios',
        message: '¿Estás seguro de que quieres descartar los cambios realizados?',
        cssClass: 'custom-alert',
        buttons: [
          {
            text: 'Continuar Editando',
            role: 'cancel',
            cssClass: 'alert-button-cancel'
          },
          {
            text: 'Descartar',
            role: 'destructive',
            cssClass: 'alert-button-confirm',
            handler: () => {
              this.router.navigate(['/tabs/perfil']);
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.router.navigate(['/tabs/perfil']);
    }
  }

  // Mostrar toast
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}