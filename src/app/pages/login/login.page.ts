import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api';

import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  rut: string = '';
  password: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private pacienteStore: PacienteStoreService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async login() {
    this.error = '';

    if (!this.rut.trim() || !this.password.trim()) {
      this.error = 'Por favor ingresa RUT y contraseña';
      this.vibrate();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent',
      translucent: true
    });
    await loading.present();

    try {
      const resp = await this.api.loginUsuario(this.rut, this.password);

      if (!resp.ok) {
        this.error = resp.error || 'Credenciales incorrectas';
        this.vibrate();
        return;
      }

      await loading.dismiss();
      await this.showToast('¡Bienvenido, ' + resp.user.nombre + '!', 'success');

      const usuario = resp.user;
      localStorage.setItem('usuario', JSON.stringify({
        ...resp.user,
        idFichaMedica: resp.user.idFichaMedica
      }));

      await this.router.navigate(['/tabs/inicio'], { replaceUrl: true });
    } catch (err: any) {
      await loading.dismiss();
      this.error = err.error || 'Error al conectar con el servidor';
      this.vibrate();
    } finally {
      this.isLoading = false;
      await loading.dismiss();
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