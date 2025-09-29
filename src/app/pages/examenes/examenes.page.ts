import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService } from 'src/app/services/api';

export interface ExamenListado {
  idProcedimiento: number; // Mantener id original en DB
  nombre: string;
  idTipoProcedimiento: number;
  tipoProcedimiento: string;
}

@Component({
  selector: 'app-examenes',
  templateUrl: './examenes.page.html',
  styleUrls: ['./examenes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ExamenesPage implements OnInit {
  paciente?: Paciente;
  examenes: ExamenListado[] = [];
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

    this.loadExamenes();
  }

  private async loadExamenes() {
    this.isLoading = true;
    try {
      this.examenes = await this.apiService.getProcedimientosFicha(this.paciente!.id); // endpoint sigue siendo procedimientos
    } catch (err) {
      console.error('Error cargando exámenes:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
