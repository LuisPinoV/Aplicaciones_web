import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ExamenesService } from 'src/app/core/servicios/examenes.service';
import { DiagnosticosService } from 'src/app/core/servicios/diagnosticos.service';
import { HospitalizacionesService } from 'src/app/core/servicios/hospitalizaciones.service';
import { ConsultasService } from 'src/app/core/servicios/consultas.service';
import { MedicamentosService } from 'src/app/core/servicios/medicamentos.service';
import { AlergiasService } from 'src/app/core/servicios/alergias.service';
import { ProcedimientosService } from 'src/app/core/servicios/procedimientos.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ficha-paciente-acciones',
  templateUrl: './ficha-paciente-acciones.component.html',
  styleUrls: ['./ficha-paciente-acciones.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FichaPacienteAccionesComponent implements OnChanges {
  @Input() paciente?: Paciente;

  contadorExamenes = 0;
  contadorDiagnosticos = 0;
  contadorHospitalizaciones = 0;
  contadorConsultas = 0;
  contadorMedicamentos = 0;
  contadorAlergias = 0;
  contadorProcedimientos = 0;

  constructor(
    private router: Router,
    private examenesService: ExamenesService,
    private diagnosticosService: DiagnosticosService,
    private hospitalizacionesService: HospitalizacionesService,
    private consultasService: ConsultasService,
    private medicamentosService: MedicamentosService,
    private alergiasService: AlergiasService,
    private procedimientosService: ProcedimientosService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['paciente'] && this.paciente?.id) {
      this.cargarContadores(this.paciente.id);
    }
  }

  private async cargarContadores(idPaciente: number) {
    try {
      this.examenesService.getContadorPorPaciente(1).subscribe({
        next: (cantidad) => {
          this.contadorExamenes = cantidad;
        }
      });
      this.diagnosticosService.getContadorPorPaciente(1).subscribe({
        next: (cantidad) => {
          this.contadorDiagnosticos = cantidad;
        }
      });
      this.hospitalizacionesService.getContadorPorPaciente(1).subscribe({
        next: (cantidad) => {
          this.contadorHospitalizaciones = cantidad;
        }
      });
      this.consultasService.getContadorPorPaciente(1).subscribe({
        next: (cantidad) => {
          this.contadorConsultas = cantidad;
        }
      });
      this.medicamentosService.getContadorPorPaciente(1).subscribe({
        next: (cantidad) => {
          this.contadorMedicamentos = cantidad;
        }
      });
      this.alergiasService.getContadorPorPaciente(1).subscribe({
        next: (cantidad) => {
          this.contadorAlergias = cantidad;
        }
      });
      this.procedimientosService.getContadorPorPaciente(1).subscribe({
        next: (cantidad) => {
          this.contadorProcedimientos = cantidad;
        }
      });
    } catch (err) {
      console.error('Error cargando contadores', err);
    }
  }

  irAExamenes() {
    this.router.navigate(['/tabs/historial/examenes']);
  }

  irADiagnosticos() {
    this.router.navigate(['/tabs/historial/diagnosticos']);
  }

  irAHospitalizaciones() {
    this.router.navigate(['/tabs/historial/hospitalizaciones']);
  }

  irAConsultas() {
    this.router.navigate(['/tabs/historial/consultas']);
  }

  irAMedicamentos() {
    this.router.navigate(['/tabs/historial/medicamentos']);
  }

  irAAlergias() {
    this.router.navigate(['/tabs/historial/alergias']);
  }

  irAProcedimientos() {
    this.router.navigate(['/tabs/historial/procedimientos']);
  }
}
