import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Alergia } from 'src/app/core/servicios/alergias.service';

@Component({
  selector: 'app-alergia-card',
  templateUrl: './alergia-card.component.html',
  styleUrls: ['./alergia-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AlergiaCardComponent {
  @Input() alergia!: Alergia;
  @Input() index?: number;

  constructor() { }

  /**
   * Determina la clase CSS para el indicador de severidad.
   */
  getSeverityClass(): string {
    if (!this.alergia?.severidad) return 'leve';
    switch (this.alergia.severidad.toLowerCase()) {
      case 'alta': return 'grave';
      case 'moderada': return 'moderado';
      case 'leve': return 'leve';
      default: return 'leve';
    }
  }

  /**
   * Determina la clase CSS para el badge de severidad en el footer.
   */
  getSeverityBadgeClass(): string {
    if (!this.alergia?.severidad) return 'leve-badge';
    switch (this.alergia.severidad.toLowerCase()) {
      case 'alta': return 'grave-badge';
      case 'moderada': return 'moderado-badge';
      case 'leve': return 'leve-badge';
      default: return 'leve-badge';
    }
  }

  /**
   * Devuelve un icono basado en el tipo de alergia.
   */
  getAlergiaIcon(): string {
    if (!this.alergia?.tipo) return 'shield-outline';
    const tipo = this.alergia.tipo.toLowerCase();
    if (tipo.includes('medicamento')) return 'medkit-outline';
    if (tipo.includes('alimentaria')) return 'restaurant-outline';
    if (tipo.includes('ambiental')) return 'leaf-outline';
    if (tipo.includes('contacto')) return 'hand-left-outline';
    return 'shield-outline';
  }
}