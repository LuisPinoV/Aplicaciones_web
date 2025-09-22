import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Diagnostico } from 'src/app/core/servicios/diagnosticos.service';

@Component({
  selector: 'app-diagnostico-card',
  templateUrl: './diagnostico-card.component.html',
  styleUrls: ['./diagnostico-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DiagnosticoCardComponent {
  @Input() diagnostico?: Diagnostico;
  @Input() index?: number;

  getDiagnosticoIcon(): string {
    if (!this.diagnostico) return 'medical-outline';
    
    const nombre = this.diagnostico.nombre.toLowerCase();
    
    // Mapeo de palabras clave a iconos
    if (nombre.includes('diabetes')) return 'fitness-outline';
    if (nombre.includes('hipertension') || nombre.includes('presión')) return 'heart-outline';
    if (nombre.includes('resfriado') || nombre.includes('gripe')) return 'thermometer-outline';
    if (nombre.includes('fractura') || nombre.includes('hueso')) return 'bonfire-outline';
    if (nombre.includes('cardio') || nombre.includes('corazón')) return 'heart-pulse-outline';
    if (nombre.includes('respiratorio') || nombre.includes('pulmon')) return 'lung-outline';
    if (nombre.includes('gastro') || nombre.includes('estómago')) return 'nutrition-outline';
    if (nombre.includes('neurológico') || nombre.includes('cerebro')) return 'brain-outline';
    if (nombre.includes('infección')) return 'bug-outline';
    if (nombre.includes('alergia')) return 'alert-circle-outline';
    
    return 'medical-outline'; // Icono por defecto
  }

  getSeverityClass(): string {
    // Lógica para determinar gravedad basada en el diagnóstico
    if (!this.diagnostico) return 'leve';
    
    const nombre = this.diagnostico.nombre.toLowerCase();
    
    // Palabras clave que indican gravedad
    if (nombre.includes('cáncer') || nombre.includes('tumor') || nombre.includes('crisis') || 
        nombre.includes('infarto') || nombre.includes('grave')) {
      return 'grave';
    }
    
    if (nombre.includes('crónico') || nombre.includes('diabetes') || nombre.includes('hipertensión') ||
        nombre.includes('moderado')) {
      return 'moderado';
    }
    
    return 'leve'; // Por defecto
  }

  getTiempoTranscurrido(): string {
    if (!this.diagnostico?.fecha) return '';
    
    const fechaDiagnostico = new Date(this.diagnostico.fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaDiagnostico.getTime();
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);
    
    if (años > 0) {
      return años === 1 ? 'Hace 1 año' : `Hace ${años} años`;
    } else if (meses > 0) {
      return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
    } else if (dias > 0) {
      return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
    } else {
      return 'Hoy';
    }
  }

  getEstadoTexto(): string {
    if (!this.diagnostico?.fecha) return 'Activo';
    
    const fechaDiagnostico = new Date(this.diagnostico.fecha);
    const ahora = new Date();
    const diasTranscurridos = Math.floor((ahora.getTime() - fechaDiagnostico.getTime()) / (1000 * 60 * 60 * 24));
    
    const nombre = this.diagnostico.nombre.toLowerCase();
    
    // Condiciones que sugieren resolución
    if (nombre.includes('resfriado') || nombre.includes('gripe')) {
      return diasTranscurridos > 14 ? 'Resuelto' : 'Activo';
    }
    
    // Condiciones crónicas
    if (nombre.includes('diabetes') || nombre.includes('hipertensión') || nombre.includes('crónico')) {
      return 'Crónico';
    }
    
    // Por defecto, condiciones recientes están activas
    return diasTranscurridos < 365 ? 'Activo' : 'Crónico';
  }

  getEstadoClass(): string {
    const estado = this.getEstadoTexto().toLowerCase();
    return estado; // 'activo', 'cronico', 'resuelto'
  }
}