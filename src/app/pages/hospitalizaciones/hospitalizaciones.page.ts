import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { HospitalizacionesService, Hospitalizacion } from 'src/app/core/servicios/hospitalizaciones.service';
import { HospitalizacionCardComponent } from 'src/app/compartidos/componentes/hospitalizacion-card/hospitalizacion-card.component';

@Component({
  selector: 'app-hospitalizaciones',
  templateUrl: './hospitalizaciones.page.html',
  styleUrls: ['./hospitalizaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HospitalizacionCardComponent]
})
export class HospitalizacionesPage implements OnInit {
  paciente?: Paciente;
  hospitalizaciones: Hospitalizacion[] = [];

  constructor(
    private pacienteStore: PacienteStoreService,
    private hospitalizacionesService: HospitalizacionesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();

    if (!this.paciente) {
      this.router.navigate(['/buscar']);
      return;
    }

    this.hospitalizacionesService.getPorPaciente(this.paciente.idFichaMedica).subscribe({
      next: (data) => (this.hospitalizaciones = data),
      error: (err) => console.error('Error cargando hospitalizaciones:', err)
    });
  }

  getInitials(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
