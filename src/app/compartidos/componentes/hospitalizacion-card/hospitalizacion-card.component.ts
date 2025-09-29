import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// Interfaz que refleja exactamente tu tabla Hospitalizacion
export interface Hospitalizacion {
  idHospitalizacion: number;
  idFichaMedica: number;
  fecha: string;
  duracion: number;
  institucionMedica: string;
}

@Component({
  selector: 'app-hospitalizacion-card',
  templateUrl: './hospitalizacion-card.component.html',
  styleUrls: ['./hospitalizacion-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HospitalizacionCardComponent {
  @Input() hospitalizacion!: Hospitalizacion; // "!" porque siempre debería recibir datos

  // Formatea la fecha
  getFechaFormateada(): string {
    if (!this.hospitalizacion?.fecha) return '';
    const fecha = new Date(this.hospitalizacion.fecha);
    return fecha.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Formatea la duración en días
  getDuracionFormateada(): string {
    if (!this.hospitalizacion?.duracion) return '';
    return `${this.hospitalizacion.duracion} ${this.hospitalizacion.duracion === 1 ? 'día' : 'días'}`;
  }
}
