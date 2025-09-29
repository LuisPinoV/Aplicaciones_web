import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService } from 'src/app/services/api';

interface ConsultaListado {
  fecha: string;
  medicoNombre: string;
  institucionMedica: string;
  descripcion: string;
}

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ConsultasPage implements OnInit {
  paciente?: Paciente;
  consultas: ConsultaListado[] = [];
  isLoading = false;

  constructor(
    private pacienteStore: PacienteStoreService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();

    if (!this.paciente) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadConsultas();
  }

  private async loadConsultas() {
    this.isLoading = true;

    try {
      this.consultas = await this.apiService.getConsultasPorFicha(this.paciente!.id);
    } catch (err) {
      console.error('Error cargando consultas:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
