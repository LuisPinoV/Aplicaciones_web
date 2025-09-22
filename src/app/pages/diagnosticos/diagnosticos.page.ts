import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Diagnostico, DiagnosticosService } from 'src/app/core/servicios/diagnosticos.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { DiagnosticoCardComponent } from 'src/app/compartidos/componentes/diagnostico-card/diagnostico-card.component';

@Component({
  selector: 'app-diagnosticos',
  templateUrl: './diagnosticos.page.html',
  styleUrls: ['./diagnosticos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, DiagnosticoCardComponent]
})
export class DiagnosticosPage implements OnInit {
  paciente?: Paciente;
  diagnosticos: Diagnostico[] = [];

  constructor(
    private pacienteStore: PacienteStoreService,
    private diagnosticosService: DiagnosticosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();

    if (!this.paciente) {
      this.router.navigate(['/buscar']);
      return;
    }

    this.diagnosticosService.getPorPaciente(this.paciente.id).subscribe({
      next: (data) => (this.diagnosticos = data),
      error: (err) => console.error('Error cargando diagnósticos:', err)
    });
  }

  // Funciones para las estadísticas
  getDiagnosticosRecientes(): number {
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    return this.diagnosticos.filter(d => new Date(d.fecha) >= tresMesesAtras).length;
  }

  getDiagnosticosActivos(): number {
    // Como no tienes campo 'activo' en la interfaz, puedes usar otra lógica
    // Por ejemplo, diagnósticos del último año
    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
    return this.diagnosticos.filter(d => new Date(d.fecha) >= unAnoAtras).length;
  }

  // Función para generar iniciales del paciente
  getInitials(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Función para optimizar el renderizado de la lista
  trackByDiagnostico(index: number, item: Diagnostico): number {
    return item.id;
  }
}