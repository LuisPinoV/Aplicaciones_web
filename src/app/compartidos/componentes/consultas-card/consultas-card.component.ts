import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Consulta } from 'src/app/core/servicios/consultas.service';

@Component({
  selector: 'app-consultas-card',
  templateUrl: './consultas-card.component.html',
  styleUrls: ['./consultas-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ConsultasCardComponent {
  @Input() consultas?: Consulta;

  /**
   * Obtiene la clase CSS para el indicador de severidad/prioridad
   */
  getConsultaSeverityClass(): string {
    // La lógica original se basaba en 'prioridad' y 'especialidad', que ya no existen.
    // Se devuelve una clase por defecto.
    return 'severity-normal';
  }

  /**
   * Obtiene el ícono apropiado para la consulta
   */
  getConsultaIcon(): string {
    // La lógica original se basaba en 'especialidad', que ya no existe.
    // Se devuelve un ícono por defecto.
    return 'medical-outline'; // Ícono por defecto
  }

  /**
   * Determina si se debe mostrar el footer
   */
  shouldShowFooter(): boolean {
    return !!this.getTiempoTranscurrido();
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
    // La lógica original se basaba en 'estado', que ya no existe.
    return 'estado-default';
  }

  /**
   * Obtiene el texto del estado para mostrar
   */
  getEstadoTexto(): string {
    // La lógica original se basaba en 'estado', que ya no existe.
    return '';
  }
}