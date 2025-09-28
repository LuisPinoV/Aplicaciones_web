import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from '../../core/servicios/paciente-store.service';
import { Paciente } from '../../core/servicios/pacientes.service';
import { ProcedimientosService, Procedimiento } from '../../core/servicios/procedimientos.service';
import { ProcedimientosCardComponent } from '../../compartidos/componentes/procedimientos-card/procedimientos-card.component';

@Component({
  selector: 'app-procedimientos',
  templateUrl: './procedimientos.page.html',
  styleUrls: ['./procedimientos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ProcedimientosCardComponent]
})
export class ProcedimientosPage implements OnInit {
  paciente?: Paciente;
  procedimientos: Procedimiento[] = [];

  constructor(
    private pacienteStore: PacienteStoreService,
    private procedimientosService: ProcedimientosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();
    if (!this.paciente) {
      this.router.navigate(['/buscar']);
      return;
    }
    this.procedimientosService.getPorPaciente(this.paciente.idFichaMedica).subscribe({
      next: (data: Procedimiento[]) => (this.procedimientos = data),
      error: (err: any) => console.error('Error cargando procedimientos:', err)
    });
  }

  getInitials(nombre: string): string {
    if (!nombre) return '';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}