import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacientesService } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BuscarPage {
  rut: string = '';
  error: string = '';

  constructor(
    private router: Router,
    private pacientesService: PacientesService,
    private pacienteStore: PacienteStoreService
  ) {}

  buscarPaciente() {
    this.error = '';
    if (!this.rut.trim()) {
      this.error = 'Por favor ingresa un RUT válido';
      return;
    }

    this.pacientesService.getPacientePorRut(this.rut).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.pacienteStore.setPaciente(data[0]);
          this.router.navigate(['/ficha-medica']);
        } else {
          this.error = 'No se encontró un paciente con ese RUT';
        }
      },
      error: () => {
        this.error = 'Error al consultar pacientes';
      }
    });
  }
}
