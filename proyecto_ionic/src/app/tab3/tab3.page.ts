import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, FichaMedica, Consulta, Medicamento, Examen, Diagnostico, Alergia } from '../services/api';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';

interface Paciente {
  idUsuario: number;
  nombre: string;
  Rut: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Tab3Page implements OnInit {
  paciente?: Paciente;

  // Datos del paciente
  fichaNombre: string = '';
  fichaEdad: number = 0;
  fichaSexo: string = '';
  fichaTipoSangre: string = '';

  // Contadores
  totalMedicamentos: number = 0;
  totalAlergias: number = 0;
  totalExamenes: number = 0;
  totalConsultas: number = 0;

  // Datos de secciones (máximo 5 elementos)
  consultasRecientes: Consulta[] = [];
  medicamentosActivos: Medicamento[] = [];
  examenesRecientes: Examen[] = [];
  diagnosticosRecientes: Diagnostico[] = [];
  alergias: Alergia[] = [];

  cargando: boolean = true;
  idFicha: number = 1; // Cambiar según tu lógica de autenticación

  constructor(
    private api: ApiService,
    private router: Router,
    private pacienteStore: PacienteStoreService
  ) {}

  async ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
      try {
        this.paciente = JSON.parse(usuarioGuardado) as Paciente;
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
        this.paciente = undefined;
      }
    }

    if (!this.paciente) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }

    await this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      // Cargar información básica de la ficha
      const fichaCompleta = await this.api.getFichaCompleta(this.idFicha);
      const ficha = fichaCompleta.ficha;
      
      this.fichaNombre = ficha.nombre;
      this.fichaSexo = ficha.sexo;
      this.fichaTipoSangre = ficha.tipoSangre;
      
      // Calcular edad
      const fechaNac = new Date(ficha.fechaNacimiento);
      const hoy = new Date();
      this.fichaEdad = hoy.getFullYear() - fechaNac.getFullYear();

      // Cargar datos de cada sección en paralelo
      await Promise.all([
        this.cargarConsultas(),
        this.cargarMedicamentos(),
        this.cargarExamenes(),
        this.cargarDiagnosticos(),
        this.cargarAlergias()
      ]);

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async cargarConsultas() {
    try {
      const consultas = await this.api.getConsultasPorFicha(this.idFicha);
      this.totalConsultas = consultas.length;
      
      this.consultasRecientes = consultas
        .sort((a: Consulta, b: Consulta) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 3);
    } catch (error) {
      console.error('Error al cargar consultas:', error);
    }
  }

  async cargarMedicamentos() {
    try {
      const medicamentos = await this.api.getMedicamentosPorFicha(this.idFicha);
      this.totalMedicamentos = medicamentos.length;
      this.medicamentosActivos = medicamentos.slice(0, 3);
    } catch (error) {
      console.error('Error al cargar medicamentos:', error);
    }
  }

  async cargarExamenes() {
    try {
      const examenes = await this.api.getExamenesPorFicha(this.idFicha);
      this.totalExamenes = examenes.length;
      
      this.examenesRecientes = examenes
        .sort((a: Examen, b: Examen) => new Date(b.fechaExamen).getTime() - new Date(a.fechaExamen).getTime())
        .slice(0, 3);
    } catch (error) {
      console.error('Error al cargar exámenes:', error);
    }
  }

  async cargarDiagnosticos() {
    try {
      const diagnosticos = await this.api.getDiagnosticosPorFicha(this.idFicha);
      
      this.diagnosticosRecientes = diagnosticos
        .sort((a: Consulta, b: Consulta) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 3);
    } catch (error) {
      console.error('Error al cargar diagnósticos:', error);
    }
  }

  async cargarAlergias() {
    try {
      const alergias = await this.api.getAlergiasPorFicha(this.idFicha);
      this.totalAlergias = alergias.length;
      
      this.alergias = alergias.slice(0, 3);
    } catch (error) {
      console.error('Error al cargar alergias:', error);
    }
  }

  // Navegación
  navegarA(seccion: string) {
    switch (seccion) {
      case 'medicamentos':
        this.router.navigate(['/tabs/historial/medicamentos']);
        break;
      case 'alergias':
        this.router.navigate(['/tabs/historial/alergias']);
        break;
      case 'examenes':
        this.router.navigate(['/tabs/historial/examenes']);
        break;
      case 'consultas':
        this.router.navigate(['/tabs/historial/consultas']);
        break;
      case 'diagnosticos':
        this.router.navigate(['/tabs/historial/diagnosticos']);
        break;
      case 'historial':
        this.router.navigate(['/tabs/historial']);
        break;
    }
  }

  verDetalle(tipo: string, id: number) {
    // Navegar al detalle según el tipo
    switch (tipo) {
      case 'consulta':
        this.router.navigate(['/tabs/historial/consultas', id]);
        break;
      case 'medicamento':
        this.router.navigate(['/tabs/historial/medicamentos', id]);
        break;
      case 'examen':
        this.router.navigate(['/tabs/historial/examenes', id]);
        break;
      case 'diagnostico':
        this.router.navigate(['/tabs/historial/diagnosticos', id]);
        break;
      case 'alergia':
        this.router.navigate(['/tabs/historial/alergias', id]);
        break;
    }
  }

  // Utilidades
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-CL', opciones);
  }

  tieneDatos(): boolean {
    return (
      this.consultasRecientes.length > 0 ||
      this.medicamentosActivos.length > 0 ||
      this.examenesRecientes.length > 0 ||
      this.diagnosticosRecientes.length > 0 ||
      this.alergias.length > 0
    );
  }
}