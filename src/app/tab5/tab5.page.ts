import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api';

interface Paciente {
  idUsuario: number;
  nombre: string;
  Rut: string;
  fechaNacimiento: string;
  sexo: string;
  tipoSangre: string;
}

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab5Page implements OnInit {
  paciente?: Paciente;
  pacienteOriginal?: Paciente;
  isLoading = true;
  isSaving = false;
  editingField: string | null = null;
  maxDate: string;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.maxDate = new Date().toISOString();
  }

  async ngOnInit() {
    await this.cargarDatosPaciente();
  }

  async cargarDatosPaciente() {
    this.isLoading = true;
    
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
      try {
        const usuarioLocal = JSON.parse(usuarioGuardado) as Paciente;
        
        // Intentar obtener datos actualizados del servidor
        try {
          this.paciente = await this.apiService.getPacienteById(usuarioLocal.idUsuario);
          this.pacienteOriginal = { ...this.paciente };
          
          // Actualizar localStorage con datos frescos
          localStorage.setItem('usuario', JSON.stringify(this.paciente));
        } catch (error) {
          console.error('Error al obtener datos del servidor, usando datos locales:', error);
          this.paciente = usuarioLocal;
          this.pacienteOriginal = { ...usuarioLocal };
        }
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
        this.paciente = undefined;
      }
    }

    if (!this.paciente) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }

    this.isLoading = false;
  }

  async guardarCambio(campo: keyof Paciente) {
    if (!this.paciente || this.isSaving) return;

    // Verificar si realmente hubo cambio
    if (this.paciente[campo] === this.pacienteOriginal?.[campo]) {
      this.editingField = null;
      return;
    }

    this.isSaving = true;
    
    try {
      const datosActualizar: Partial<Paciente> = {
        [campo]: this.paciente[campo]
      };

      const pacienteActualizado = await this.apiService.updatePaciente(
        this.paciente.idUsuario,
        datosActualizar
      );

      // Actualizar datos locales
      this.paciente = { ...this.paciente, ...pacienteActualizado };
      this.pacienteOriginal = { ...this.paciente };
      
      // Actualizar localStorage
      localStorage.setItem('usuario', JSON.stringify(this.paciente));

      await this.mostrarToast('Cambio guardado correctamente', 'success');
      this.editingField = null;
    } catch (error: any) {
      console.error('Error al guardar cambio:', error);
      
      // Revertir cambio en caso de error
      if (this.pacienteOriginal) {
        (this.paciente as any)[campo] = this.pacienteOriginal[campo];
      }
      
      await this.mostrarToast('Error al guardar el cambio', 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  cancelarEdicion(campo: keyof Paciente) {
    if (this.pacienteOriginal && this.paciente) {
      (this.paciente as any)[campo] = this.pacienteOriginal[campo];
    }
    this.editingField = null;
  }

  iniciarEdicion(campo: string) {
    this.editingField = campo;
  }

  async confirmarCerrarSesion() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            this.cerrarSesion();
          }
        }
      ]
    });

    await alert.present();
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
}