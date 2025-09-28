import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PacientesService, Paciente } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private pacientesService: PacientesService,
    private pacienteStore: PacienteStoreService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async login() {
    // Limpiar errores previos
    this.error = '';

    // Validaciones básicas
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Por favor ingresa correo y contraseña';
      this.vibrate();
      return;
    }

    // Validar formato de email
    if (!this.isValidEmail(this.email)) {
      this.error = 'Por favor ingresa un correo válido';
      this.vibrate();
      return;
    }

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent',
      translucent: true
    });
    await loading.present();

    this.isLoading = true;

    try {
      // Buscar pacientes por mail
      const pacientes = await this.pacientesService.getPacientes().toPromise();
      const encontrado = pacientes?.find(p => p.mail === this.email);

      if (encontrado) {
        // Validar contraseña
        if (encontrado.password !== this.password) {
          await loading.dismiss();
          this.error = 'Contraseña incorrecta. Verifica tus credenciales.';
          this.vibrate();
          return;
        }

        // Simular delay de autenticación para mejor UX
        await this.delay(1000);

        // Guardar datos del paciente
        this.pacienteStore.setPaciente(encontrado);
        localStorage.setItem('usuario', JSON.stringify(encontrado));

        // Cerrar loading
        await loading.dismiss();
        
        // Mostrar toast de éxito
        await this.showToast('¡Bienvenido!', 'success');
        
        // Navegar con animación
        await this.router.navigate(['/tabs/tab1'], {
          replaceUrl: true
        });

      } else {
        await loading.dismiss();
        this.error = 'Correo no encontrado. Verifica tus credenciales.';
        this.vibrate();
      }

    } catch (error) {
      await loading.dismiss();
      this.error = 'Error al conectar con el servicio. Intenta nuevamente.';
      this.vibrate();
      console.error('Error en login:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Validar formato de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Función para crear delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mostrar toast mensaje
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top',
      buttons: [
        {
          text: 'X',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // Vibración para errores (si está disponible)
  private vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }

  // Limpiar errores cuando el usuario empiece a escribir
  onInputChange() {
    if (this.error) {
      this.error = '';
    }
  }

  // Método para manejar Enter en los inputs
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.login();
    }
  }
}