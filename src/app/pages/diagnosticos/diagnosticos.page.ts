import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService } from 'src/app/services/api';

interface DiagnosticoListado {
  fecha: string;
  descripcion: string;
}

@Component({
  selector: 'app-diagnosticos',
  templateUrl: './diagnosticos.page.html',
  styleUrls: ['./diagnosticos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DiagnosticosPage implements OnInit {
  paciente?: Paciente;
  diagnosticos: DiagnosticoListado[] = [];
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

    this.loadDiagnosticos();
  }

  private async loadDiagnosticos() {
    this.isLoading = true;

    try {
      this.diagnosticos = await this.apiService.getDiagnosticosPorFicha(this.paciente!.id);
    } catch (err) {
      console.error('Error cargando diagnósticos:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
