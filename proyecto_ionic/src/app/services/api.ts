import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Paciente {
  idUsuario: number;
  nombre: string;
  Rut: string;
  fechaNacimiento: string;
  sexo: string;
  tipoSangre: string;
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
  _isNew?: boolean;
}

export interface Hospitalizacion {
  idHospitalizacion: number;
  idFichaMedica: number;
  fecha: string;
  duracion: number;
  motivo: string;
  institucionMedica: string;
  _isNew?: boolean;
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
  _isNew?: boolean;
}

export interface Medicamento {
  idConsultaMedicamento: number;
  idMedicamento: number;
  idTipoMedicamento: number;
  tipoMedicamento: string;
  nombreMedicamento: string;
  descripcionMedicamento: string;
  cantidad: number;
  formato: string;
  tiempoConsumo: number;
  frecuenciaConsumo: string;
  _isNew?: boolean;
}

export interface Alergia {
  idFichaMedicaAlergia: number;
  idAlergia: number;
  idTipoAlergia: number;
  nombreAlergia: string;
  descripcionAlergia: string;
  tipoAlergia: string;
  fechaAlergia: string;
  _isNew?: boolean;
}

export interface Procedimiento {
  idFichaMedicaCirujia: number;
  idCirujia: number;
  nombreCirujia: string;
  descripcionCirujia: string;
  idTipoCirujia: number;
  tipoCirujia: string;
  fecha: string;
  descripcion: string;
  _isNew?: boolean;
}

export interface Examen {
  idFichaMedicaExamen: number;
  idExamen: number;
  nombreExamen: string;
  descripcionExamen: string;
  idTipoExamen: number;
  tipoExamen: string;
  fechaExamen: string;
  descripcionFicha: string;
  resultadosObtenidos?: ResultadoObtenido[];
  resultadosEsperados?: ResultadoEsperado[];
  _isNew?: boolean;
}

export interface ResultadoObtenido {
  idResultadoObtenido: number;
  idFichaMedicaExamen: number;
  nombre: string;
  valor: number;
  formato: string;
}

export interface ResultadoEsperado {
  idResultadoEsperado: number;
  idExamen: number;
  nombre: string;
  valor: number;
  formato: string;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://zmemy6qrul.execute-api.us-east-1.amazonaws.com';

  private fichasSubject = new BehaviorSubject<FichaMedica[]>([]);
  fichas$: Observable<FichaMedica[]> = this.fichasSubject.asObservable();

  constructor() {}
  
  // === Fichas médicas ===
  async getFichasPaginadas(limit: number, offset: number): Promise<{
    data: FichaMedica[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      nextOffset: number | null;
      hasMore: boolean;
    };
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas?limit=${limit}&offset=${offset}`);
    
    // Emitir al observable el nuevo conjunto de fichas
    const data = res.data.data || [];
    if (offset === 0) {
      this.fichasSubject.next(data);
    } else {
      // Si es un scroll, concatenar con las ya existentes
      const prev = this.fichasSubject.getValue();
      this.fichasSubject.next([...prev, ...data]);
    }

    return res.data;
  }


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



  // Examenes

  async getExamenesPorFicha(idFicha: number): Promise<Examen[]> {
    const res = await axios.get<{ data: Examen[] }>(
      `${this.baseUrl}/fichas/${idFicha}/examenes`
    );
    return res.data.data;
  }

  async actualizarFichaExamen(idFichaMedicaExamen: number, data: any): Promise<any> {
    const res = await axios.put(`${this.baseUrl}/fichas/examenes/${idFichaMedicaExamen}`, data);
    return res.data;
  }

  async eliminarFichaExamen(idFichaMedicaExamen: number): Promise<any> {
    const res = await axios.delete(`${this.baseUrl}/fichas/examenes/${idFichaMedicaExamen}`);
    return res.data;
  }

  async obtenerExamenPorId(idFichaMedicaExamen: number): Promise<Examen> {
    const res = await axios.get(`${this.baseUrl}/fichas/examenes/${idFichaMedicaExamen}`);
    return res.data;
  }

  async obtenerExamenesDisponibles(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/examenes`);
      if (!res.ok) throw new Error('Error al obtener exámenes disponibles');
      return await res.json();
    } catch (err) {
      console.error('Error en obtenerExamenesDisponibles:', err);
      return [];
    }
  }

  async getResultadosEsperadosByExamen(idExamen: number): Promise<ResultadoEsperado[]> {
    const res = await axios.get(`${this.baseUrl}/resultados/esperados/${idExamen}`);
    return res.data;
  }

  async agregarExamen(data: any): Promise<any> {
    const res = await axios.post(`${this.baseUrl}/fichas/examenes`, data);
    return res.data;
  }

  async getExamenesPaginados(
    idFicha: number,
    limit: number,
    offset: number
  ): Promise<{
    data: Examen[];
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



  // Diagnosticos

  async getDiagnosticosPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/diagnosticos`);
    return res.data.data;
  }

  async actualizarDiagnostico(idDiagnostico: number, data: any): Promise<any> {
    const res = await axios.put(`${this.baseUrl}/fichas/diagnosticos/${idDiagnostico}`, data);
    return res.data;
  }

  async eliminarDiagnostico(idDiagnostico: number): Promise<any> {
    const res = await axios.delete(`${this.baseUrl}/fichas/diagnosticos/${idDiagnostico}`);
    return res.data;
  }

  async obtenerDiagnosticoPorId(idDiagnostico: number): Promise<Diagnostico> {
    const res = await axios.get(`${this.baseUrl}/fichas/diagnosticos/${idDiagnostico}`);
    return res.data;
  }

  async agregarDiagnostico(data: any): Promise<any> {
    const res = await axios.post(`${this.baseUrl}/fichas/diagnosticos`, data);
    return res.data;
  }

  async getDiagnosticosPaginados(idFicha: number, limit: number, offset: number): Promise<{
    data: Diagnostico[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      nextOffset: number | null;
      hasMore: boolean;
    };
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/diagnosticos?limit=${limit}&offset=${offset}`);
    return res.data;
  }

  async getEstadisticasDiagnosticos(idFicha: number): Promise<{
    total: number;
    recientes: number;
    activos: number;
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/diagnosticos/estadisticas`);
    return res.data;
  }



  // Hospitalizaciones
  async getHospitalizacionesPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/hospitalizaciones`);
    return res.data.data;
  }

  async actualizarHospitalizacion(idHospitalizacion: number, data: any): Promise<any> {
    const res = await axios.put(`${this.baseUrl}/fichas/hospitalizaciones/${idHospitalizacion}`, data);
    return res.data;
  }

  async eliminarHospitalizacion(idHospitalizacion: number): Promise<any> {
    const res = await axios.delete(`${this.baseUrl}/fichas/hospitalizaciones/${idHospitalizacion}`);
    return res.data;
  }

  async obtenerHospitalizacionPorId(idHospitalizacion: number): Promise<Hospitalizacion> {
    const res = await axios.get(`${this.baseUrl}/fichas/hospitalizaciones/${idHospitalizacion}`);
    return res.data;
  }

  async agregarHospitalizacion(data: any): Promise<any> {
    const res = await axios.post(`${this.baseUrl}/fichas/hospitalizaciones`, data);
    return res.data;
  }

  async getHospitalizacionesPaginados(idFicha: number, limit: number, offset: number): Promise<{
    data: Hospitalizacion[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      nextOffset: number | null;
      hasMore: boolean;
    };
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/hospitalizaciones?limit=${limit}&offset=${offset}`);
    return res.data;
  }

  async getEstadisticasHospitalizaciones(idFicha: number): Promise<{
    total: number;
    recientes: number;
    activos: number;
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/hospitalizaciones/estadisticas`);
    return res.data;
  }





  // Consultas

  async getConsultasPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/consultas`);
    return res.data.data;
  }

  async actualizarConsulta(idConsulta: number, data: any): Promise<any> {
    const res = await axios.put(`${this.baseUrl}/fichas/consultas/${idConsulta}`, data);
    return res.data;
  }

  async eliminarConsulta(idConsulta: number): Promise<any> {
    const res = await axios.delete(`${this.baseUrl}/fichas/consultas/${idConsulta}`);
    return res.data;
  }

  async obtenerConsultaPorId(idConsulta: number): Promise<Consulta> {
    const res = await axios.get(`${this.baseUrl}/fichas/consultas/${idConsulta}`);
    return res.data;
  }

  async agregarConsulta(data: any): Promise<any> {
    const res = await axios.post(`${this.baseUrl}/fichas/consultas`, data);
    return res.data;
  }

  async getConsultasPaginados(idFicha: number, limit: number, offset: number): Promise<{
    data: Consulta[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      nextOffset: number | null;
      hasMore: boolean;
    };
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/consultas?limit=${limit}&offset=${offset}`);
    return res.data;
  }

  async getEstadisticasConsultas(idFicha: number): Promise<{
    total: number;
    recientes: number;
    activos: number;
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/consultas/estadisticas`);
    return res.data;
  }

  async obtenerMedicos(): Promise<any[]> {
    const res = await axios.get(`${this.baseUrl}/medicos`);
    return res.data;
  }

  async crearMedico(medico: { nombre: string }): Promise<any> {
    const res = await axios.post(`${this.baseUrl}/medicos`, medico);
    return res.data;
  }





  // Procedimientos

  async getProcedimientosPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/procedimientos`);
    return res.data.data;
  }

  async actualizarProcedimiento(idConsulta: number, data: any): Promise<any> {
    const res = await axios.put(`${this.baseUrl}/fichas/procedimientos/${idConsulta}`, data);
    return res.data;
  }

  async eliminarProcedimiento(idConsulta: number): Promise<any> {
    const res = await axios.delete(`${this.baseUrl}/fichas/procedimientos/${idConsulta}`);
    return res.data;
  }

  async obtenerProcedimientoPorId(idConsulta: number): Promise<Procedimiento> {
    const res = await axios.get(`${this.baseUrl}/fichas/procedimientos/${idConsulta}`);
    return res.data;
  }

  async agregarProcedimiento(data: any): Promise<any> {
    const res = await axios.post(`${this.baseUrl}/fichas/procedimientos`, data);
    return res.data;
  }

  async getProcedimientosPaginados(idFicha: number, limit: number, offset: number): Promise<{
    data: Procedimiento[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      nextOffset: number | null;
      hasMore: boolean;
    };
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/procedimientos?limit=${limit}&offset=${offset}`);
    return res.data;
  }

  async getEstadisticasProcedimientos(idFicha: number): Promise<{
    total: number;
    recientes: number;
    activos: number;
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/procedimientos/estadisticas`);
    return res.data;
  }

    async obtenerProcedimientosDisponibles(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/procedimientos`);
      if (!res.ok) throw new Error('Error al obtener procedimientos disponibles');
      return await res.json();
    } catch (err) {
      console.error('Error en obtenerProcedimientosDisponibles:', err);
      return [];
    }
  }





  // Medicamentos

  async getMedicamentosPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/medicamentos`);
    return res.data.data;
  }

  async actualizarMedicamento(idMedicamento: number, data: any): Promise<any> {
    const res = await axios.put(`${this.baseUrl}/fichas/medicamentos/${idMedicamento}`, data);
    return res.data;
  }

  async eliminarMedicamento(idMedicamento: number): Promise<any> {
    const res = await axios.delete(`${this.baseUrl}/fichas/medicamentos/${idMedicamento}`);
    return res.data;
  }

  async obtenerMedicamentoPorId(idMedicamento: number): Promise<Medicamento> {
    const res = await axios.get(`${this.baseUrl}/fichas/medicamentos/${idMedicamento}`);
    return res.data;
  }

  async agregarMedicamento(data: any): Promise<any> {
    const res = await axios.post(`${this.baseUrl}/fichas/medicamentos`, data);
    return res.data;
  }

  async getMedicamentosPaginados(idFicha: number, limit: number, offset: number): Promise<{
    data: Medicamento[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      nextOffset: number | null;
      hasMore: boolean;
    };
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/medicamentos?limit=${limit}&offset=${offset}`);
    return res.data;
  }

  async getEstadisticasMedicamentos(idFicha: number): Promise<{
    total: number;
    recientes: number;
    activos: number;
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/medicamentos/estadisticas`);
    return res.data;
  }

  async medicamentosDisponibles(): Promise<any[]> {
    const res = await axios.get(`${this.baseUrl}/medicamentos`);
    return res.data;
  }

  async tiposMedicamentos(): Promise<any[]> {
    const res = await axios.get(`${this.baseUrl}/tipos-medicamentos`);
    return res.data;
  }

  async crearNuevoMedicamento(data: { nombreMedicamento: string; descripcionMedicamento?: string; idTipoMedicamento: number }): Promise<any> {
    const res = await axios.post(`${this.baseUrl}/medicamentos`, data);
    return res.data;
  }







  // Alergias

  async getAlergiasPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/alergias`);
    return res.data.data;
  }

  async actualizarAlergia(idFichaMedicaAlergia: number, data: any): Promise<any> {
    const res = await axios.put(`${this.baseUrl}/fichas/alergias/${idFichaMedicaAlergia}`, data);
    return res.data;
  }

  async eliminarAlergia(idFichaMedicaAlergia: number): Promise<any> {
    const res = await axios.delete(`${this.baseUrl}/fichas/alergias/${idFichaMedicaAlergia}`);
    return res.data;
  }

  async obtenerAlergiaPorId(idFichaMedicaAlergia: number): Promise<Alergia> {
    const res = await axios.get(`${this.baseUrl}/fichas/alergias/${idFichaMedicaAlergia}`);
    return res.data;
  }

  async agregarAlergia(data: any): Promise<any> {
    const res = await axios.post(`${this.baseUrl}/fichas/alergias`, data);
    return res.data;
  }

  async getAlergiasPaginados(idFicha: number, limit: number, offset: number): Promise<{
    data: Alergia[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      nextOffset: number | null;
      hasMore: boolean;
    };
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/alergias?limit=${limit}&offset=${offset}`);
    return res.data;
  }

  async getEstadisticasAlergias(idFicha: number): Promise<{
    total: number;
    recientes: number;
    activos: number;
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/alergias/estadisticas`);
    return res.data;
  }

    async obtenerAlergiasDisponibles(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/alergias`);
      if (!res.ok) throw new Error('Error al obtener procedimientos disponibles');
      return await res.json();
    } catch (err) {
      console.error('Error en obtenerProcedimientosDisponibles:', err);
      return [];
    }
  }




  // === LOGIN ===
  async loginUsuario(rut: string, password: string): Promise<any> {
    try {
      const res = await axios.post(`${this.baseUrl}/login`, { Rut: rut, password });
      return res.data;
    } catch (error: any) {
      console.error('Error en login:', error);
      throw error.response?.data || { ok: false, error: 'Error de conexión' };
    }
  }

  /**
   * Obtener un paciente por ID desde la base de datos
   */
  async getPacienteById(idUsuario: number): Promise<Paciente> {
    console.log
    const res = await axios.get(`${this.baseUrl}/pacientes/${idUsuario}`);
    return res.data;
  }

  /**
   * Actualizar datos de un paciente en la base de datos
   */
  async updatePaciente(idUsuario: number, paciente: Partial<Paciente>): Promise<Paciente> {
    const res = await axios.put(`${this.baseUrl}/pacientes/${idUsuario}`, paciente);
    return res.data;
  }

  /**
   * Obtener todos los pacientes
   */
  async getAllPacientes(): Promise<Paciente[]> {
    const res = await axios.get(`${this.baseUrl}/pacientes`);
    return res.data;
  }

  /**
   * Crear un nuevo paciente
   */
  async createPaciente(paciente: Omit<Paciente, 'idUsuario'>): Promise<Paciente> {
    const res = await axios.post(`${this.baseUrl}/pacientes`, paciente);
    return res.data;
  }

  /**
   * Eliminar un paciente
   */
  async deletePaciente(idUsuario: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/pacientes/${idUsuario}`);
  }










  /**
   * Obtener paciente desde cache (fallback)
   */
  getPacienteFromCache(idUsuario: number): Paciente | null {
    const cacheKey = `paciente_${idUsuario}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    try {
      const { data, timestamp } = JSON.parse(cached);
      
      // Cache válido por 1 hora
      const isValid = Date.now() - timestamp < 3600000;
      
      return isValid ? data : null;
    } catch (error) {
      console.error('Error leyendo cache:', error);
      return null;
    }
  }

  /**
   * Limpiar todo el cache de pacientes
   */
  clearAllCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('paciente_')) {
        localStorage.removeItem(key);
      }
    });
  }

}
