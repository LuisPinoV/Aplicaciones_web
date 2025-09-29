import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService } from 'src/app/services/api';

interface AlergiaListado {
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-alergias',
  templateUrl: './alergias.page.html',
  styleUrls: ['./alergias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AlergiasPage implements OnInit {
  paciente?: Paciente;
  alergias: string[] = [];
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

    this.loadAlergias();
  }

  private async loadAlergias() {
    this.isLoading = true;

    try {
      this.alergias = await this.apiService.getAlergiasPorPaciente(this.paciente!.id);
    } catch (err) {
      console.error('Error cargando alergias:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
