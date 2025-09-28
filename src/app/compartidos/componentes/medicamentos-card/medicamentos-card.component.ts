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

  getIconoPorFormato(): string {
    if (!this.medicamento?.formato) return 'ellipse-outline';
    const formato = this.medicamento.formato.toLowerCase();
    if (formato.includes('comprimido')) return 'ellipse-outline';
    if (formato.includes('cápsula')) return 'hardware-chip-outline';
    if (formato.includes('jarabe')) return 'beaker-outline';
    if (formato.includes('inyección')) return 'eyedrop-outline';
    return 'ellipse-outline';
  }
}