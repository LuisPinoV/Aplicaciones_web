import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

interface Cirugia {
  idCirujia: number;
  nombreCirugia: string;
  descripcionCirugia: string;
  tipoCirugia: number;
  fechaCirugia: string;
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

interface Examen {
  idFichaMedicaExamen: number;
  idExamen: number;
  nombreExamen: string;
  descripcionExamen: string;
  idTipoExamen: number;
  tipoExamen: string;
  fechaExamen: string;
  descripcionFicha: string;
  _isNew?: boolean;
}

@Component({
  selector: 'app-ficha-paciente-acciones',
  templateUrl: './ficha-paciente-acciones.component.html',
  styleUrls: ['./ficha-paciente-acciones.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FichaPacienteAccionesComponent implements OnChanges {
  @Input() paciente?: any;

  contadorExamenes?: number;
  contadorDiagnosticos?: number;
  contadorHospitalizaciones?: number;
  contadorConsultas?: number;
  contadorMedicamentos?: number;
  contadorAlergias?: number;
  contadorCirugias?: number;

  constructor(
    private router: Router,
    private api: ApiService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['paciente'] && this.paciente?.idUsuario) {
      this.cargarContadoresDesdeLocalStorage();
    }
  }

  private cargarContadoresDesdeLocalStorage() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const paciente = JSON.parse(usuarioGuardado);
      const idFichaMedica = paciente.idFichaMedica;

      if (idFichaMedica) {
        this.cargarContadores(idFichaMedica);
      } else {
        console.error("No se encontró idFichaMedica en localStorage");
      }
    }
  }

  private async cargarContadores(idFichaMedica: number) {
    try {
      const [
        examenes,
        diagnosticos,
        hospitalizaciones,
        consultas,
        cirugias,
        medicamentos,
        alergias
      ] = await Promise.all([
        this.api.getExamenesPorFicha(idFichaMedica),
        this.api.getDiagnosticosPorFicha(idFichaMedica),
        this.api.getHospitalizacionesPorFicha(idFichaMedica),
        this.api.getConsultasPorFicha(idFichaMedica),
        this.api.getProcedimientosPorFicha(idFichaMedica),
        this.api.getMedicamentosPorFicha(idFichaMedica),
        this.api.getAlergiasPorFicha(idFichaMedica)
      ]);

      // Asignar directamente los valores
      this.contadorExamenes = examenes?.length || 0;
      this.contadorDiagnosticos = diagnosticos?.length || 0;
      this.contadorHospitalizaciones = hospitalizaciones?.length || 0;
      this.contadorConsultas = consultas?.length || 0;
      this.contadorCirugias = cirugias?.length || 0;
      this.contadorMedicamentos = medicamentos?.length || 0;
      this.contadorAlergias = alergias?.length || 0;

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
