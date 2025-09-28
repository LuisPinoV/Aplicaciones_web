import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Procedimiento } from 'src/app/core/servicios/procedimientos.service';

@Component({
  selector: 'app-procedimientos-card',
  templateUrl: './procedimientos-card.component.html',
  styleUrls: ['./procedimientos-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProcedimientosCardComponent {
  @Input() procedimiento!: Procedimiento;
  @Input() index?: number;

  constructor() { }

  getTipoClass(): string {
    if (!this.procedimiento?.tipo) return 'diagnostico';
    const tipo = this.procedimiento.tipo.toLowerCase();
    if (tipo.includes('quirúrgico')) return 'quirurgico';
    if (tipo.includes('preventivo')) return 'preventivo';
    return 'diagnostico';
  }

  getTipoIcon(): string {
    if (!this.procedimiento?.tipo) return 'document-text-outline';
    const tipo = this.procedimiento.tipo.toLowerCase();
    if (tipo.includes('quirúrgico')) return 'cut-outline';
    if (tipo.includes('preventivo')) return 'shield-checkmark-outline';
    return 'analytics-outline';
  }
}