import { Injectable } from '@angular/core';
import { Paciente } from './pacientes.service';

@Injectable({ providedIn: 'root' })
export class PacienteStoreService {
  private pacienteSeleccionado?: Paciente;

  setPaciente(paciente: Paciente) {
    this.pacienteSeleccionado = paciente;
  }

  getPaciente(): Paciente | undefined {
    return this.pacienteSeleccionado;
  }

  clearPaciente() {
    this.pacienteSeleccionado = undefined;
  }
}