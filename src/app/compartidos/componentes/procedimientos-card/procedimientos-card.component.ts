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

  constructor() { }

  getTipoClass(): string {
    if (!this.procedimiento?.nombre) return 'diagnostico';
    const tipo = this.procedimiento.nombre.toLowerCase();
    if (tipo.includes('cirugía') || tipo.includes('extirpación')) return 'cirugia';
    if (tipo.includes('examen') || tipo.includes('muestra')) return 'examen';
    return 'diagnostico';
  }

  getTipoIcon(): string {
    if (!this.procedimiento?.nombre) return 'document-text-outline';
    const tipo = this.procedimiento.nombre.toLowerCase();
    if (tipo.includes('cirugía')) return 'cut-outline';
    if (tipo.includes('examen')) return 'flask-outline';
    if (tipo.includes('radiografía') || tipo.includes('rayos')) return 'pulse-outline';
    return 'document-text-outline';
  }
}