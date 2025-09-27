import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Medicamento } from 'src/app/core/servicios/medicamentos.service';

@Component({
  selector: 'app-medicamentos-card',
  templateUrl: './medicamentos-card.component.html',
  styleUrls: ['./medicamentos-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MedicamentosCardComponent {
  @Input() medicamento!: Medicamento;

  constructor() { }

  getEstadoClass(): string {
    if (!this.medicamento?.estado) return 'finalizado';
    switch (this.medicamento.estado.toLowerCase()) {
      case 'activo': return 'activo';
      case 'suspendido': return 'suspendido';
      default: return 'finalizado';
    }
  }

  getViaIcon(): string {
    if (!this.medicamento?.via) return 'ellipse-outline';
    const via = this.medicamento.via.toLowerCase();
    if (via.includes('oral')) return 'ellipse-outline';
    if (via.includes('inhalatoria')) return 'cloud-outline';
    if (via.includes('intravenosa')) return 'water-outline';
    return 'ellipse-outline';
  }
}