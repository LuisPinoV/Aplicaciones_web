import { Component, Input, OnInit } from '@angular/core';
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
export class FichaPacienteCardComponent implements OnInit {
  @Input() paciente: Paciente | null = null;

  constructor() { }

  ngOnInit() {}

  get edad(): string {
    if (!this.paciente?.fechaNacimiento) return '—';
    const birthDate = new Date(this.paciente.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
  }

  get displaySex(): string {
    if (!this.paciente?.sexo) return '—';
    
    const sexo = this.paciente.sexo.toLowerCase();
    return sexo === 'masculino' || sexo === 'm'
      ? 'Masculino'
      : sexo === 'femenino' || sexo === 'f'
      ? 'Femenino'
      : this.paciente.sexo;
  }

  get displaySexShort(): string {
    if (!this.paciente?.sexo) return '—';
    
    const sexo = this.paciente.sexo.toLowerCase();
    return sexo === 'masculino' || sexo === 'm'
      ? 'M'
      : sexo === 'femenino' || sexo === 'f'
      ? 'F'
      : '—';
  }

  getInitials(nombre?: string): string {
    if (!nombre) return '?';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2); // Limitamos a 2 iniciales máximo
  }

  editarPaciente() {
    // TODO: Implementar la lógica para editar el paciente
    console.log('Editar paciente');
  }
}