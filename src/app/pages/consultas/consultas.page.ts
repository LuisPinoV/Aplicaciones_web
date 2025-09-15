import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ConsultasService, Consultas } from 'src/app/core/servicios/consultas.service';
import { ConsultasCardComponent } from 'src/app/compartidos/componentes/consultas-card/consultas-card.component';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ConsultasCardComponent]
})
export class ConsultasPage implements OnInit {
  paciente?: Paciente;
  consultas: Consultas[] = [];

  constructor(
    private pacienteStore: PacienteStoreService,
    private consultasService: ConsultasService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();

    if (!this.paciente) {
      this.router.navigate(['/buscar']);
      return;
    }

    this.consultasService.getPorPaciente(this.paciente.id).subscribe({
      next: (data) => (this.consultas = data),
      error: (err) => console.error('Error cargando consultas:', err)
    });
  }

}