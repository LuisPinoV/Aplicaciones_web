import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { FichaPacienteCardComponent } from 'src/app/compartidos/componentes/ficha-paciente-card/ficha-paciente-card.component';
import { FichaPacienteAccionesComponent } from 'src/app/compartidos/componentes/ficha-paciente-acciones/ficha-paciente-acciones.component';

@Component({
  selector: 'app-ficha-medica',
  templateUrl: './ficha-medica.page.html',
  styleUrls: ['./ficha-medica.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FichaPacienteCardComponent, FichaPacienteAccionesComponent]
})
export class FichaMedicaPage implements OnInit {
  paciente?: Paciente;

  constructor(
    private pacienteStore: PacienteStoreService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();
    if (!this.paciente) {
      this.router.navigate(['/buscar']);
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
