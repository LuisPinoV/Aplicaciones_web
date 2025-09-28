import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { FichaPacienteAccionesComponent } from 'src/app/compartidos/componentes/ficha-paciente-acciones/ficha-paciente-acciones.component';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FichaPacienteAccionesComponent]
})
export class Tab4Page implements OnInit {
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
}
