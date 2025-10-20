import { Injectable } from '@angular/core';
import axios from 'axios';

export interface Paciente {
  id: number;
  rut: string;
  nombre: string;
  edad: number;
  sexo: string;
  grupo_sanguineo: string;
  telefono?: string;
  mail?: string;
}

export interface FichaMedica {
  idFichaMedica: number;
  Rut: number;
  nombre: string;
  fechaNacimiento: string;
  sexo: string;
  tipoSangre: string;
  altura: number;
  peso: number;
  genero: string;
}

export interface Diagnostico {
  idDiagnostico: number;
  idFichaMedica: number;
  fecha: string;
  descripcion: string;
}

export interface Hospitalizacion {
  idHospitalizacion: number;
  idFichaMedica: number;
  fecha: string;
  duracion: number;
  motivo: string;
  institucionMedica: string;
}

export interface Consulta {
  idConsulta: number;
  idFichaMedica: number;
  idMedico: number;
  fecha: string;
  descripcion: string;
  medicoNombre?: string;
  tipoMedico?: string;
  institucionMedica?: string;
}
export interface MedicamentoListado {
  nombre: string;
  descripcion: string;
  cantidad: number;
  formato: string;
  tiempoConsumo: number;
  frecuenciaConsumo: string;
}
export interface ProcedimientoListado {
  idProcedimiento: number;
  nombre: string;
  idTipoProcedimiento: number;
  tipoProcedimiento: string;
}

export interface AlergiaListado {
  nombre: string;
  descripcion: string;
}

export interface ProcedimientoCirugia {
  idProcedimiento: number;
  nombre: string;
  descripcion: string;
  idTipoProcedimiento: number;
  tipoProcedimiento: string;
}

export interface Procedimiento {
  idProcedimiento: number;
  nombre: string;
  descripcion: string;
  idTipoProcedimiento: number;
  tipoProcedimiento: string;
}

export interface ExamenListado {
  idExamen: number;
  nombreExamen: string;
  descripcionExamen: string;
  idTipoExamen: number;
  tipoExamen: string;
  fechaExamen: string;
  descripcionFicha: string;
}



@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://zmemy6qrul.execute-api.us-east-1.amazonaws.com';

  constructor() {}

  // === NUEVA FUNCIÓN PARA PAGINACIÓN POR CURSOR ===
  async getFichasCursor(lastId: number = 0, limit: number = 20): Promise<FichaMedica[]> {
    const response = await axios.get<FichaMedica[]>(`${this.baseUrl}/fichas`, {
      params: {
        _sort: 'idFichaMedica',
        _order: 'asc',
        idFichaMedica_gt: lastId, // Tráeme Ids mayores que el último que tengo
        _limit: limit
      }
    });
    return response.data;
  }

  // === Fichas médicas (función original, la dejamos por si se usa en otro lado) ===
  async getFichas(page: number = 1, limit: number = 25): Promise<FichaMedica[]> {
    const response = await axios.get<FichaMedica[]>(`${this.baseUrl}/fichas`, {
      params: {
        _page: page,
        _limit: limit
      }
    });
    return response.data;
  }

  async crearFicha(ficha: Partial<FichaMedica>) {
    const res = await axios.post(`${this.baseUrl}/fichas`, ficha);
    return res.data;
  }

  async getPacientes(): Promise<Paciente[]> {
    const res = await axios.get(`${this.baseUrl}/pacientes`);
    return res.data;
  }

  async getFichaCompleta(id: number): Promise<{
    ficha: FichaMedica;
    diagnosticos: Diagnostico[];
    hospitalizaciones: Hospitalizacion[];
    consultas: Consulta[];
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${id}`);
    return res.data;
  }

  async getDiagnosticos(): Promise<Diagnostico[]> {
    const res = await axios.get(`${this.baseUrl}/diagnosticos`);
    return res.data;
  }

  async getHospitalizaciones(): Promise<Hospitalizacion[]> {
    const res = await axios.get(`${this.baseUrl}/hospitalizaciones`);
    return res.data;
  }

  async getConsultas(): Promise<Consulta[]> {
    const res = await axios.get(`${this.baseUrl}/consultas`);
    return res.data;
  }

  async getMedicamentosFicha(id: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${id}/medicamentos`);
    return res.data;
  }

  async getProcedimientosFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/procedimientos`);
    return res.data;
  }

  async getMedicamentosPorPaciente(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/medicamentos`);
    return res.data;
  }

  async getProcedimientosPorPaciente(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/procedimientos`);
    return res.data;
  }

  async getAlergiasPorPaciente(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/alergias`);
    return res.data;
  }

  // Exámenes por ficha
  async getExamenesPorFicha(idFicha: number): Promise<ExamenListado[]> {
    const res = await axios.get<{ data: ExamenListado[] }>(
      `${this.baseUrl}/fichas/${idFicha}/examenes`
    );
    return res.data.data;
  }

  // 2️⃣ Obtener exámenes paginados
  async getExamenesPaginados(
    idFicha: number,
    limit: number,
    offset: number
  ): Promise<{
    data: ExamenListado[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      nextOffset: number | null;
      hasMore: boolean;
    };
  }> {
    const res = await axios.get(
      `${this.baseUrl}/fichas/${idFicha}/examenes?limit=${limit}&offset=${offset}`
    );
    return res.data;
  }

  // 3️⃣ Obtener estadísticas de exámenes
  async getEstadisticasExamenes(idFicha: number): Promise<{
    total: number;
    recientes: number;
    activos: number;
  }> {
    const res = await axios.get(
      `${this.baseUrl}/fichas/${idFicha}/examenes/estadisticas`
    );
    return res.data;
  }

  // Hospitalizaciones por ficha
  async getHospitalizacionesPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/hospitalizaciones`);
    return res.data;
  }

  async getConsultasPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/consultas`);
    return res.data;
  }

  async getDiagnosticosPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/diagnosticos`);
    return res.data;
  }

  async getMedicamentosPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/medicamentos`);
    return res.data;
  }

  async getExamenesFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/examenes`);
    return res.data;
  }
  
  async getProcedimientosCirugiaPorFicha(idFicha: number): Promise<ProcedimientoCirugia[]> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/procedimientos`);
    return res.data;
  }
}
