import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService } from 'src/app/services/api';

interface MedicamentoListado {
  nombre: string;
  descripcion: string;
  cantidad: number;
  formato: string;
  tiempoConsumo: number;
  frecuenciaConsumo: string;
}

@Component({
  selector: 'app-medicamentos',
  templateUrl: './medicamentos.page.html',
  styleUrls: ['./medicamentos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MedicamentosPage implements OnInit {
  paciente?: Paciente;
  medicamentos: MedicamentoListado[] = [];
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

    this.loadMedicamentos();
  }

  private async loadMedicamentos() {
    this.isLoading = true;
    try {
      const data = await this.apiService.getMedicamentosPorFicha(this.paciente!.id);
      console.log('Medicamentos recibidos:', data); // Verifica los nombres de campos
      this.medicamentos = data.map((med: any) => ({
        nombre: med.nombre,
        descripcion: med.descripcion,
        cantidad: med.cantidad,
        formato: med.formato,
        tiempoConsumo: med.tiempoConsumo,
        frecuenciaConsumo: med.frecuenciaConsumo
      }));
    } catch (err) {
      console.error('Error cargando medicamentos:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
