import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Paciente } from 'src/app/core/servicios/pacientes.service';

@Component({
  selector: 'app-ficha-paciente-card',
  templateUrl: './ficha-paciente-card.component.html',
  styleUrls: ['./ficha-paciente-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FichaPacienteCardComponent {
  @Input() paciente?: Paciente;

  getInitials(nombre?: string): string {
    if (!nombre) return '?';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  get displayAge(): string {
    return this.paciente ? `${this.paciente.edad} años` : '—';
  }

  get displaySex(): string {
    return this.paciente?.sexo === 'M'
      ? 'Masculino'
      : this.paciente?.sexo === 'F'
      ? 'Femenino'
      : this.paciente?.sexo || '—';
  }
}
