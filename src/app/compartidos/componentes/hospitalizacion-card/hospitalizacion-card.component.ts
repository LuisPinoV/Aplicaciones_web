import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Hospitalizacion, HospitalizacionesService } from 'src/app/core/servicios/hospitalizaciones.service';

@Component({
  selector: 'app-hospitalizacion-card',
  templateUrl: './hospitalizacion-card.component.html',
  styleUrls: ['./hospitalizacion-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HospitalizacionCardComponent {
  @Input() hospitalizacion?: Hospitalizacion;

  getHospitalizacionSeverityClass(): string {
    if (!this.hospitalizacion) return 'leve';
    return this.hospitalizacion.gravedad || 'leve';
  }

  getHospitalizacionEstadoClass(): string {
    if (!this.hospitalizacion?.estado) return 'activo';
    
    return HospitalizacionesService.obtenerClaseEstado(this.hospitalizacion.estado);
  }

  getDuracionTranscurrida(): string {
    if (!this.hospitalizacion?.fecha) return '';
    
    return HospitalizacionesService.calcularTiempoTranscurrido(this.hospitalizacion.fecha);
  }

  getHospitalizacionIcon(): string {
    if (!this.hospitalizacion?.especialidad) return 'business-outline';
    
    return HospitalizacionesService.obtenerIconoPorEspecialidad(this.hospitalizacion.especialidad);
  }

  // Método adicional para formatear la duración si es necesario
  getDuracionFormateada(): string {
    if (!this.hospitalizacion?.duracion) return '';
    
    // Si la duración ya viene formateada, la retornamos
    if (this.hospitalizacion.duracion.includes('día') || 
        this.hospitalizacion.duracion.includes('mes') || 
        this.hospitalizacion.duracion.toLowerCase().includes('curso')) {
      return this.hospitalizacion.duracion;
    }
    
    // Si viene como número, lo formateamos
    const numero = parseInt(this.hospitalizacion.duracion);
    if (!isNaN(numero)) {
      return `${numero} ${numero === 1 ? 'día' : 'días'}`;
    }
    
    return this.hospitalizacion.duracion;
  }

  // Método para determinar si mostrar el footer
  shouldShowFooter(): boolean {
    return !!(this.hospitalizacion?.estado || this.getDuracionTranscurrida());
  }

  // Método para obtener el texto del estado formateado
  getEstadoTexto(): string {
    if (!this.hospitalizacion?.estado) return '';
    
    return this.hospitalizacion.estado.toUpperCase();
  }
}