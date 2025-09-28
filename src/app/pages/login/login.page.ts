import { Component, OnInit } from '@angular/core';
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
export class LoginPage implements OnInit {
  email = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(
    private router: Router,
    private pacientesService: PacientesService,
    private pacienteStore: PacienteStoreService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Redirigir a la pestaña 1 si ya hay un usuario almacenado
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      this.router.navigate(['/tabs/tab1']);
    }
  }

  onInputChange() {
    this.error = '';
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.login();
    }
  }

  async login() {
    if (!this.email || !this.password) {
      this.presentToast('Por favor, ingrese RUT y contraseña.');
      return;
    }

    // El RUT se ingresa en el campo de email
    const rut = this.email;

    this.pacientesService.getPacientePorRut(rut).subscribe({
      next: (paciente) => {
        if (paciente) {
          // En un caso real, aquí se verificaría la contraseña hasheada.
          // Por simplicidad, solo verificamos que el paciente exista.
          this.pacienteStore.setPaciente(paciente);
          this.router.navigate(['/tabs/tab1']);
        } else {
          this.presentToast('RUT o contraseña incorrectos.');
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.presentToast('Error al intentar iniciar sesión. Verifique la consola.');
      }
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
    });
    toast.present();
  }
}