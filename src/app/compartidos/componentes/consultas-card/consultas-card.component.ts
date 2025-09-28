import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Consultas } from 'src/app/core/servicios/consultas.service';

@Component({
  selector: 'app-consultas-card',
  templateUrl: './consultas-card.component.html',
  styleUrls: ['./consultas-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ConsultasCardComponent {
  @Input() consultas?: Consultas;
  @Input() index?: number;

  /**
   * Obtiene la clase CSS para el indicador de severidad/prioridad
   */
  getConsultaSeverityClass(): string {
    if (!this.consultas) return '';
    
    // Lógica basada en prioridad o tipo de consulta
    if (this.consultas.prioridad) {
      switch (this.consultas.prioridad.toLowerCase()) {
        case 'alta':
        case 'urgente':
          return 'severity-high';
        case 'media':
        case 'moderada':
          return 'severity-medium';
        case 'baja':
        case 'normal':
          return 'severity-low';
        default:
          return 'severity-normal';
      }
    }
    
    // Si no hay prioridad, usar especialidad como referencia
    if (this.consultas.especialidad) {
      const especialidadesUrgentes = ['urgencia', 'emergencia', 'cardiología', 'neurología'];
      if (especialidadesUrgentes.some(esp => 
        this.consultas!.especialidad!.toLowerCase().includes(esp))) {
        return 'severity-high';
      }
    }
    
    return 'severity-normal';
  }

  /**
   * Obtiene el ícono apropiado para la consulta
   */
  getConsultaIcon(): string {
    if (!this.consultas?.especialidad) return 'medical-outline';
    
    const especialidad = this.consultas.especialidad.toLowerCase();
    
    // Mapeo de especialidades a íconos
    const iconMap: { [key: string]: string } = {
      'cardiología': 'heart-outline',
      'cardiology': 'heart-outline',
      'neurología': 'brain-outline',
      'neurology': 'brain-outline',
      'pediatría': 'baby-outline',
      'pediatrics': 'baby-outline',
      'traumatología': 'bone-outline',
      'traumatology': 'bone-outline',
      'oftalmología': 'eye-outline',
      'ophthalmology': 'eye-outline',
      'dermatología': 'body-outline',
      'dermatology': 'body-outline',
      'psiquiatría': 'happy-outline',
      'psychiatry': 'happy-outline',
      'ginecología': 'woman-outline',
      'gynecology': 'woman-outline',
      'urología': 'male-outline',
      'urology': 'male-outline',
      'urgencia': 'warning-outline',
      'emergency': 'warning-outline',
      'medicina general': 'medical-outline',
      'general medicine': 'medical-outline'
    };
    
    // Buscar coincidencia parcial
    for (const [key, icon] of Object.entries(iconMap)) {
      if (especialidad.includes(key)) {
        return icon;
      }
    }
    
    return 'medical-outline'; // Ícono por defecto
  }

  /**
   * Determina si se debe mostrar el footer
   */
  shouldShowFooter(): boolean {
    return !!(this.getTiempoTranscurrido() || 
             (this.consultas?.estado && this.getEstadoTexto()));
  }

  /**
   * Calcula el tiempo transcurrido desde la consulta
   */
  getTiempoTranscurrido(): string {
    if (!this.consultas?.fecha) return '';
    
    const fechaConsulta = new Date(this.consultas.fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaConsulta.getTime();
    
    // Si la fecha es futura, no mostrar tiempo transcurrido
    if (diferencia < 0) return '';
    
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

  /**
   * Obtiene la clase CSS para el estado de la consulta
   */
  getConsultaEstadoClass(): string {
    if (!this.consultas?.estado) return '';
    
    switch (this.consultas.estado.toLowerCase()) {
      case 'completada':
      case 'finalizada':
      case 'completed':
        return 'estado-completada';
      case 'pendiente':
      case 'programada':
      case 'scheduled':
        return 'estado-pendiente';
      case 'cancelada':
      case 'cancelled':
        return 'estado-cancelada';
      case 'en proceso':
      case 'en curso':
      case 'in progress':
        return 'estado-en-proceso';
      default:
        return 'estado-default';
    }
  }

  /**
   * Obtiene el texto del estado para mostrar
   */
  getEstadoTexto(): string {
    if (!this.consultas?.estado) return '';
    
    const estado = this.consultas.estado.toLowerCase();
    
    // Mapeo de estados a texto más amigable
    const estadoMap: { [key: string]: string } = {
      'completada': 'Completada',
      'finalizada': 'Finalizada',
      'completed': 'Completada',
      'pendiente': 'Pendiente',
      'programada': 'Programada',
      'scheduled': 'Programada',
      'cancelada': 'Cancelada',
      'cancelled': 'Cancelada',
      'en proceso': 'En Proceso',
      'en curso': 'En Curso',
      'in progress': 'En Proceso'
    };
    
    return estadoMap[estado] || this.consultas.estado;
  }
}