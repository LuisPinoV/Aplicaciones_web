import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject, Observable } from 'rxjs';

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



@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://zmemy6qrul.execute-api.us-east-1.amazonaws.com';

  private fichasSubject = new BehaviorSubject<FichaMedica[]>([]);
  fichas$: Observable<FichaMedica[]> = this.fichasSubject.asObservable();

  constructor() {}

  // === Fichas médicas ===
  async getFichas(): Promise<FichaMedica[]> {
    const res = await axios.get(`${this.baseUrl}/fichas`);
    return res.data;
  }

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

  async actualizarFicha(id: number, ficha: Partial<FichaMedica>) {
    const res = await axios.put(`${this.baseUrl}/fichas/${id}`, ficha);
    const fichaActualizada = res.data;

    const prev = this.fichasSubject.getValue();
    const index = prev.findIndex(f => f.idFichaMedica === id);
    if (index !== -1) {
      prev[index] = fichaActualizada;
      this.fichasSubject.next([...prev]); // dispara actualización
    }

    return fichaActualizada;
  }

  async crearFicha(ficha: Partial<FichaMedica>) {
    const res = await axios.post(`${this.baseUrl}/fichas`, ficha);
    const nuevaFicha = res.data;

    const prev = this.fichasSubject.getValue();
    this.fichasSubject.next([nuevaFicha, ...prev]);

    return nuevaFicha;
  }

  // === Pacientes ===
  async getPacientes(): Promise<Paciente[]> {
    const res = await axios.get(`${this.baseUrl}/pacientes`);
    return res.data;
  }

  // === Ficha completa ===
  async getFichaCompleta(id: number): Promise<{
    ficha: FichaMedica;
    diagnosticos: Diagnostico[];
    hospitalizaciones: Hospitalizacion[];
    consultas: Consulta[];
  }> {
    const res = await axios.get(`${this.baseUrl}/fichas/${id}`);
    return res.data;
  }

  //Diagnósticos 
  async getDiagnosticos(): Promise<Diagnostico[]> {
    const res = await axios.get(`${this.baseUrl}/diagnosticos`);
    return res.data;
  }

  // Hospitalizaciones
  async getHospitalizaciones(): Promise<Hospitalizacion[]> {
    const res = await axios.get(`${this.baseUrl}/hospitalizaciones`);
    return res.data;
  }

  //  Consultas 
  async getConsultas(): Promise<Consulta[]> {
    const res = await axios.get(`${this.baseUrl}/consultas`);
    return res.data;
  }
  // Obtener medicamentos de una ficha
  async getMedicamentosFicha(id: number) {
  const res = await axios.get(`${this.baseUrl}/fichas/${id}/medicamentos`);
  return res.data;
  }
  async getProcedimientosFicha(idFicha: number) {
  const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/procedimientos`);
  return res.data;
  }
    // Medicamentos por ficha
  async getMedicamentosPorPaciente(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/medicamentos`);
    return res.data;
  }

  //  Procedimientos por ficha
  async getProcedimientosPorPaciente(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/procedimientos`);
    return res.data;
  }

  // Alergias por ficha/paciente ===
  async getAlergiasPorPaciente(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/alergias`);
    return res.data;
  }
  // Exámenes por ficha
  async getExamenesPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/examenes`);
    return res.data;
  }
  // Hospitalizaciones por ficha
  async getHospitalizacionesPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/hospitalizaciones`);
    return res.data;
  }
  // En src/app/services/api.ts
  async getConsultasPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/consultas`);
    return res.data;
  }
  // Diagnósticos por ficha
  async getDiagnosticosPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/diagnosticos`);
    return res.data;
  }

  // Medicamentos por ficha
  async getMedicamentosPorFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/medicamentos`);
    return res.data;
  }
  // Exámenes por ficha
  async getExamenesFicha(idFicha: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/examenes`);
    return res.data;
  }
  async getProcedimientosCirugiaPorFicha(idFicha: number): Promise<ProcedimientoCirugia[]> {
    const res = await axios.get(`${this.baseUrl}/fichas/${idFicha}/procedimientos`);
    return res.data;
  }

}
