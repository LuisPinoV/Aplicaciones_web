import { Component, Input } from '@angular/core';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';

@Component({
  selector: 'app-perfil-acciones-card',
  templateUrl: './perfil-acciones-card.component.html',
  styleUrls: ['./perfil-acciones-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PerfilAccionesCardComponent {
  @Input() paciente!: Paciente;
  
  private isLoading = false;

  constructor(
    private pacienteStore: PacienteStoreService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async editarDatos() {
    if (this.isLoading) return;
    
    // Agregar clase loading al botón
    const editButton = document.querySelector('.edit-button');
    editButton?.classList.add('loading');
    this.isLoading = true;

    try {
      // Mostrar toast informativo
      await this.showToast('Abriendo editor de perfil...', 'primary');
      
      // Pequeña pausa para mejor UX
      await this.delay(500);
      
      // Navegar a editar perfil
      await this.router.navigate(['/editar-perfil']);
      
    } catch (error) {
      console.error('Error al navegar:', error);
      await this.showToast('Error al abrir el editor', 'danger');
    } finally {
      editButton?.classList.remove('loading');
      this.isLoading = false;
    }
  }

  async cerrarSesion() {
    if (this.isLoading) return;

    // Mostrar alerta de confirmación
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro que deseas cerrar tu sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel-button',
        },
        {
          text: 'Cerrar Sesión',
          role: 'confirm',
          cssClass: 'alert-confirm-button',
          handler: () => {
            this.executeLogout();
          }
        }
      ],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  private async executeLogout() {
    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
      spinner: 'crescent',
      duration: 1500
    });
    await loading.present();

    // Agregar clase loading al botón
    const logoutButton = document.querySelector('.logout-button');
    logoutButton?.classList.add('loading');
    this.isLoading = true;

    try {
      // Simular proceso de cierre (limpiar caches, etc.)
      await this.delay(1000);
      
      // Limpiar datos
      this.pacienteStore.clearPaciente();
      localStorage.removeItem('usuario');
      
      await loading.dismiss();
      
      // Toast de despedida
      await this.showToast('¡Hasta pronto!', 'success');
      
      // Navegar al login
      await this.router.navigate(['/login'], { replaceUrl: true });
      
    } catch (error) {
      await loading.dismiss();
      console.error('Error al cerrar sesión:', error);
      await this.showToast('Error al cerrar sesión', 'danger');
    } finally {
      logoutButton?.classList.remove('loading');
      this.isLoading = false;
    }
  }

  // Utility methods
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Método para vibración (si está disponible)
  private vibrate(duration: number = 100) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }
}