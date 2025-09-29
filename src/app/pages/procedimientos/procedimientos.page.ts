import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService, Procedimiento } from 'src/app/services/api';

@Component({
  selector: 'app-procedimientos',
  templateUrl: './procedimientos.page.html',
  styleUrls: ['./procedimientos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ProcedimientosPage implements OnInit {
  paciente?: Paciente;
  procedimientos: Procedimiento[] = [];
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

    this.loadProcedimientos();
  }

  private async loadProcedimientos() {
    this.isLoading = true;

    try {
      this.procedimientos = await this.apiService.getProcedimientosFicha(this.paciente!.id);
    } catch (err) {
      console.error('Error cargando procedimientos:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
