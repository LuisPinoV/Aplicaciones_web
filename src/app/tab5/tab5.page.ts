import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { FichaPacienteCardComponent } from 'src/app/compartidos/componentes/ficha-paciente-card/ficha-paciente-card.component';
import { PerfilAccionesCardComponent } from 'src/app/compartidos/componentes/perfil-acciones-card/perfil-acciones-card.component';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FichaPacienteCardComponent, PerfilAccionesCardComponent]
})
export class Tab5Page implements OnInit {
  paciente?: Paciente;

  constructor(
    private pacienteStore: PacienteStoreService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();
    if (!this.paciente) {
      this.router.navigate(['/login']);
    }
  }

  getInitials(nombre?: string): string {
    if (!nombre) return '?';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  get displayAge(): string {
    if (!this.paciente?.fechaNacimiento) return '—';
    const birthDate = new Date(this.paciente.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} años`;
  }

  get displaySex(): string {
    return this.paciente?.sexo === 'M'
      ? 'Masculino'
      : this.paciente?.sexo === 'F'
      ? 'Femenino'
      : this.paciente?.sexo || '—';
  }

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

  logout() {
    this.pacienteStore.clearPaciente();
    this.router.navigate(['/login']);
  }
}
