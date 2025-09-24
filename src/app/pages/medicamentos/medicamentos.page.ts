import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from '../../core/servicios/paciente-store.service';
import { Paciente } from '../../core/servicios/pacientes.service';
import { MedicamentosService, Medicamento } from '../../core/servicios/medicamentos.service';
import { MedicamentosCardComponent } from '../../compartidos/componentes/medicamentos-card/medicamentos-card.component';

@Component({
  selector: 'app-medicamentos',
  templateUrl: './medicamentos.page.html',
  styleUrls: ['./medicamentos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, MedicamentosCardComponent]
})
export class MedicamentosPage implements OnInit {
  paciente?: Paciente;
  medicamentos: Medicamento[] = [];

  constructor(
    private pacienteStore: PacienteStoreService,
    private medicamentosService: MedicamentosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();
    if (!this.paciente) {
      this.router.navigate(['/buscar']);
      return;
    }
    this.medicamentosService.getPorPaciente(this.paciente.id).subscribe({
      next: (data: Medicamento[]) => (this.medicamentos = data),
      error: (err: any) => console.error('Error cargando medicamentos:', err)
    });
  }

  getInitials(nombre: string): string {
    if (!nombre) return '';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}