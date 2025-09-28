import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EditarPerfilPage implements OnInit {
  
  formData: Partial<Paciente> = {};
  originalData: Partial<Paciente> = {};
  isLoading = false;

  constructor(
    private pacienteStore: PacienteStoreService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.cargarDatosPaciente();
  }

  ionViewWillEnter() {
    // También cargar datos cuando la vista esté a punto de entrar
    // por si vienen de otra pantalla
    this.cargarDatosPaciente();
  }

  // Cargar datos actuales del paciente
  private cargarDatosPaciente() {
    let paciente = this.pacienteStore.getPaciente();
    
    // Si no hay datos en el store, intentar cargar desde localStorage
    if (!paciente) {
      const usuarioLocal = localStorage.getItem('usuario');
      if (usuarioLocal) {
        try {
          paciente = JSON.parse(usuarioLocal);
          // Actualizar el store con los datos de localStorage
          if (paciente) {
            this.pacienteStore.setPaciente(paciente);
          }
        } catch (error) {
          console.error('Error al parsear datos del localStorage:', error);
        }
      }
    }
    
    if (paciente) {
      console.log('Datos del paciente cargados:', paciente); // Debug
      
      // Crear copia de los datos originales
      this.originalData = { ...paciente };
      
      // Crear copia para el formulario con todos los campos
      this.formData = {
        id: paciente.id,
        nombre: paciente.nombre || '',
        rut: paciente.rut || '',
        edad: paciente.edad || undefined,
        sexo: paciente.sexo || '',
        grupo_sanguineo: paciente.grupo_sanguineo || '',
        telefono: paciente.telefono || '',
        mail: paciente.mail || '',
        password: paciente.password // Mantener password original
      };

      console.log('FormData inicializado:', this.formData); // Debug
      
      // Forzar detección de cambios para asegurar que el formulario se actualice
      setTimeout(() => {
        console.log('FormData después del timeout:', this.formData);
      }, 100);
      
    } else {
      console.error('No se encontraron datos del paciente');
      this.showToast('Error: No se encontraron datos del usuario', 'error');
      this.router.navigate(['/tabs/perfil']);
    }
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

    if (!this.formData.edad || this.formData.edad < 1 || this.formData.edad > 120) {
      errors.push('La edad debe estar entre 1 y 120 años');
    }

    if (!this.formData.telefono?.trim()) {
      errors.push('El teléfono es obligatorio');
    }

    if (!this.formData.mail?.trim()) {
      errors.push('El correo electrónico es obligatorio');
    } else if (!this.isValidEmail(this.formData.mail)) {
      errors.push('El formato del correo electrónico no es válido');
    }

    if (!this.formData.sexo) {
      errors.push('Debe seleccionar el sexo');
    }

    if (!this.formData.grupo_sanguineo) {
      errors.push('Debe seleccionar el grupo sanguíneo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validar email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Verificar si hay cambios
  private hayaCambios(): boolean {
    return JSON.stringify(this.formData) !== JSON.stringify(this.originalData);
  }

  // Guardar cambios
  async guardarCambios() {
    // Validar formulario
    const validation = this.validarFormulario();
    if (!validation.isValid) {
      await this.showToast(`Error: ${validation.errors[0]}`, 'error');
      return;
    }

    // Verificar si hay cambios
    if (!this.hayaCambios()) {
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
      // Simular llamada a API (puedes reemplazar esto con tu servicio real)
      await this.simularGuardadoAPI();

      // Actualizar datos en el store local
      const pacienteActualizado = this.formData as Paciente;
      this.pacienteStore.setPaciente(pacienteActualizado);
      
      // Actualizar localStorage también
      localStorage.setItem('usuario', JSON.stringify(pacienteActualizado));

      await loading.dismiss();
      
      // Mostrar éxito
      await this.showToast('Perfil actualizado correctamente', 'success');
      
      // Regresar a la pantalla anterior
      await this.router.navigate(['/tabs/perfil']);

    } catch (error) {
      await loading.dismiss();
      console.error('Error al guardar:', error);
      await this.showToast('Error al guardar los cambios', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Simular guardado en API (microservicio)
  private async simularGuardadoAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simular delay de red
      setTimeout(() => {
        // Simular posible error (5% de probabilidad)
        if (Math.random() < 0.05) {
          reject(new Error('Error de conexión'));
        } else {
          console.log('Datos que se enviarían al microservicio:', this.formData);
          resolve();
        }
      }, 2000);
    });
  }

  // Cancelar edición
  async cancelarEdicion() {
    if (this.hayaCambios()) {
      const alert = await this.alertController.create({
        header: 'Descartar Cambios',
        message: '¿Estás seguro de que quieres descartar los cambios realizados?',
        buttons: [
          {
            text: 'Continuar Editando',
            role: 'cancel'
          },
          {
            text: 'Descartar',
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
  private async showToast(message: string, color: 'success' | 'error' | 'warning' | 'primary' = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // Manejar back button del sistema
  ionViewWillLeave() {
    // Aquí podrías agregar lógica adicional si el usuario sale sin guardar
  }
}