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
      .toUpperCase()
      .substring(0, 2); // Limitamos a 2 iniciales máximo
  }

  get displayAge(): string {
    if (!this.paciente?.edad) return '—';
    return `${this.paciente.edad}`;
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

  // Métodos para acciones de contacto
  callPhone() {
    if (this.paciente?.telefono) {
      window.open(`tel:${this.paciente.telefono}`, '_system');
    }
  }

  sendEmail() {
    if (this.paciente?.mail) {
      window.open(`mailto:${this.paciente.mail}`, '_system');
    }
  }

  // Getter para formatear teléfono
  get formattedPhone(): string {
    if (!this.paciente?.telefono) return '—';
    
    const phone = this.paciente.telefono.toString();
    // Formato chileno +56 9 XXXX XXXX
    if (phone.length === 11 && phone.startsWith('569')) {
      return `+56 9 ${phone.slice(3, 7)} ${phone.slice(7)}`;
    }
    return phone;
  }

  // Getter para email truncado si es muy largo
  get displayEmail(): string {
    if (!this.paciente?.mail) return '—';
    
    const email = this.paciente.mail;
    if (email.length > 25) {
      const [localPart, domain] = email.split('@');
      if (localPart.length > 15) {
        return `${localPart.substring(0, 12)}...@${domain}`;
      }
    }
    return email;
  }
}