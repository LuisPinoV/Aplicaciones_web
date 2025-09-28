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
    
    // Mapeo mejorado de palabras clave a iconos
    if (nombre.includes('diabetes')) return 'water-outline';
    if (nombre.includes('hipertension') || nombre.includes('presión')) return 'heart-outline';
    if (nombre.includes('resfriado') || nombre.includes('gripe')) return 'thermometer-outline';
    if (nombre.includes('fractura') || nombre.includes('hueso')) return 'bandage-outline';
    if (nombre.includes('cardio') || nombre.includes('corazón')) return 'heart-circle-outline';
    if (nombre.includes('respiratorio') || nombre.includes('pulmon') || nombre.includes('asma')) return 'fitness-outline';
    if (nombre.includes('gastro') || nombre.includes('estómago') || nombre.includes('digestivo')) return 'restaurant-outline';
    if (nombre.includes('neurológico') || nombre.includes('cerebro') || nombre.includes('migraña')) return 'flash-outline';
    if (nombre.includes('infección') || nombre.includes('bacteria')) return 'shield-outline';
    if (nombre.includes('alergia') || nombre.includes('alérgico')) return 'warning-outline';
    if (nombre.includes('cáncer') || nombre.includes('tumor') || nombre.includes('oncológico')) return 'cellular-outline';
    if (nombre.includes('artritis') || nombre.includes('reumático')) return 'body-outline';
    if (nombre.includes('mental') || nombre.includes('psicológico') || nombre.includes('ansiedad')) return 'happy-outline';
    
    return 'medical-outline';
  }

  getSeverityClass(): string {
    if (!this.diagnostico) return 'leve';
    
    const nombre = this.diagnostico.nombre.toLowerCase();
    
    // Detectar si el diagnóstico está resuelto
    if (this.isResolved()) {
      return 'resuelto';
    }
    
    // Palabras clave que indican gravedad alta
    if (nombre.includes('cáncer') || nombre.includes('tumor maligno') || 
        nombre.includes('crisis') || nombre.includes('infarto') || 
        nombre.includes('grave') || nombre.includes('agudo') ||
        nombre.includes('severo') || nombre.includes('crítico')) {
      return 'grave';
    }
    
    // Palabras clave que indican gravedad moderada
    if (nombre.includes('crónico') || nombre.includes('diabetes') || 
        nombre.includes('hipertensión') || nombre.includes('moderado') ||
        nombre.includes('persistente') || nombre.includes('recurrente')) {
      return 'moderado';
    }
    
    return 'leve';
  }

  getSeverityText(): string {
    const severity = this.getSeverityClass();
    switch (severity) {
      case 'grave': return 'Grave';
      case 'moderado': return 'Moderado';
      case 'resuelto': return 'Resuelto';
      default: return 'Leve';
    }
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
      return años === 1 ? '1 año' : `${años} años`;
    } else if (meses > 0) {
      return meses === 1 ? '1 mes' : `${meses} meses`;
    } else if (dias > 0) {
      return dias === 1 ? '1 día' : `${dias} días`;
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
    
    // Condiciones que se resuelven rápidamente
    if (nombre.includes('resfriado') || nombre.includes('gripe') || 
        nombre.includes('bronquitis aguda') || nombre.includes('gastroenteritis')) {
      return diasTranscurridos > 14 ? 'Resuelto' : 'Activo';
    }
    
    // Condiciones que se resuelven en tiempo medio
    if (nombre.includes('fractura') || nombre.includes('cirugía') || 
        nombre.includes('lesión') || nombre.includes('post-operatorio')) {
      return diasTranscurridos > 90 ? 'Resuelto' : 'En recuperación';
    }
    
    // Condiciones crónicas
    if (nombre.includes('diabetes') || nombre.includes('hipertensión') || 
        nombre.includes('crónico') || nombre.includes('artritis') ||
        nombre.includes('asma') || nombre.includes('epilepsia')) {
      return 'Crónico';
    }
    
    // Condiciones graves que requieren seguimiento continuo
    if (nombre.includes('cáncer') || nombre.includes('tumor') ||
        nombre.includes('cardiopatía') || nombre.includes('insuficiencia')) {
      return diasTranscurridos < 365 ? 'En tratamiento' : 'Seguimiento';
    }
    
    // Por defecto, basado en tiempo
    if (diasTranscurridos > 365) {
      return 'Seguimiento';
    } else if (diasTranscurridos > 90) {
      return 'Estable';
    } else {
      return 'Activo';
    }
  }

  getEstadoBadgeColor(): string {
    const estado = this.getEstadoTexto().toLowerCase();
    
    switch (estado) {
      case 'resuelto':
        return 'success';
      case 'crónico':
      case 'en tratamiento':
        return 'warning';
      case 'en recuperación':
      case 'estable':
        return 'primary';
      case 'seguimiento':
        return 'medium';
      case 'activo':
      default:
        return 'tertiary';
    }
  }

  getEstadoIcon(): string {
    const estado = this.getEstadoTexto().toLowerCase();
    
    switch (estado) {
      case 'resuelto':
        return 'checkmark-circle';
      case 'crónico':
        return 'infinite';
      case 'en tratamiento':
        return 'medical';
      case 'en recuperación':
        return 'trending-up';
      case 'seguimiento':
        return 'eye';
      case 'estable':
        return 'remove';
      case 'activo':
      default:
        return 'pulse';
    }
  }

  private isResolved(): boolean {
    if (!this.diagnostico?.fecha) return false;
    
    const fechaDiagnostico = new Date(this.diagnostico.fecha);
    const ahora = new Date();
    const diasTranscurridos = Math.floor((ahora.getTime() - fechaDiagnostico.getTime()) / (1000 * 60 * 60 * 24));
    const nombre = this.diagnostico.nombre.toLowerCase();
    
    // Condiciones que se consideran resueltas después de cierto tiempo
    const condicionesTemporales = [
      'resfriado', 'gripe', 'bronquitis aguda', 'gastroenteritis',
      'fractura simple', 'esguince', 'contusión', 'herida'
    ];
    
    return condicionesTemporales.some(condicion => 
      nombre.includes(condicion) && diasTranscurridos > 30
    );
  }

  // Método para manejar el clic en el botón de más opciones
  onMoreOptions() {
    // Aquí implementarías la lógica para mostrar más opciones
    console.log('Show more options for diagnostic:', this.diagnostico?.id);
  }
}