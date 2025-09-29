import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { ApiService } from '../../../services/api';


interface Procedimiento {
  idProcedimiento: number;
  nombre: string;
  idTipoProcedimiento: number;
  tipoProcedimiento: string;
}

interface Medicamento {
  idMedicamento: number;
  nombre: string;
}

interface Alergia {
  idPadecimiento: number;
  nombre: string;
}

interface Diagnostico {
  idDiagnostico: number;
  idFichaMedica: number;
  descripcion: string;
}

interface Hospitalizacion {
  idHospitalizacion: number;
  idFichaMedica: number;
}

interface Consulta {
  idConsulta: number;
  idFichaMedica: number;
}

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
    private api: ApiService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['paciente'] && this.paciente?.id) {
      this.cargarContadores(this.paciente.id);
    }
  }

  private async cargarContadores(idPaciente: number) {
    try {
      // Procedimientos de la ficha
      const procedimientos: Procedimiento[] = await this.api.getProcedimientosPorPaciente(idPaciente);
      this.contadorProcedimientos = procedimientos.length;
      this.contadorExamenes = procedimientos.filter(p => p.idTipoProcedimiento === 2).length;

      // Medicamentos
      const medicamentos: Medicamento[] = await this.api.getMedicamentosPorPaciente(idPaciente);
      this.contadorMedicamentos = medicamentos.length;

      // Alergias
      const alergias: Alergia[] = await this.api.getAlergiasPorPaciente(idPaciente);
      this.contadorAlergias = alergias.length;

      // Diagnósticos
      const diagnosticos: Diagnostico[] = await this.api.getDiagnosticos();
      this.contadorDiagnosticos = diagnosticos.filter(d => d.idFichaMedica === idPaciente).length;

      // Hospitalizaciones
      const hospitalizaciones: Hospitalizacion[] = await this.api.getHospitalizaciones();
      this.contadorHospitalizaciones = hospitalizaciones.filter(h => h.idFichaMedica === idPaciente).length;

      // Consultas
      const consultas: Consulta[] = await this.api.getConsultas();
      this.contadorConsultas = consultas.filter(c => c.idFichaMedica === idPaciente).length;

    } catch (err) {
      console.error('Error cargando contadores', err);
    }
  }

  // ================= Navegación =================
  irAExamenes() { this.router.navigate(['/tabs/historial/examenes']); }
  irADiagnosticos() { this.router.navigate(['/tabs/historial/diagnosticos']); }
  irAHospitalizaciones() { this.router.navigate(['/tabs/historial/hospitalizaciones']); }
  irAConsultas() { this.router.navigate(['/tabs/historial/consultas']); }
  irAMedicamentos() { this.router.navigate(['/tabs/historial/medicamentos']); }
  irAAlergias() { this.router.navigate(['/tabs/historial/alergias']); }
  irAProcedimientos() { this.router.navigate(['/tabs/historial/procedimientos']); }
}
