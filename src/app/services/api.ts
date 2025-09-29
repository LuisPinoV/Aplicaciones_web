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
  fechaIngreso: string;
  fechaSalida: string;
  motivo: string;
}

export interface Consulta {
  idConsulta: number;
  idFichaMedica: number;
  idMedico: number;
  fecha: string;
  descripcion: string;
  medicoNombre?: string;
  tipoMedico?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor() {}

  // === Fichas médicas ===
  async getFichas(): Promise<FichaMedica[]> {
    const res = await axios.get(`${this.baseUrl}/fichas`);
    return res.data;
  }

  async crearFicha(ficha: Partial<FichaMedica>) {
    const res = await axios.post(`${this.baseUrl}/fichas`, ficha);
    return res.data;
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

  // === Diagnósticos ===
  async getDiagnosticos(): Promise<Diagnostico[]> {
    const res = await axios.get(`${this.baseUrl}/diagnosticos`);
    return res.data;
  }

  // === Hospitalizaciones ===
  async getHospitalizaciones(): Promise<Hospitalizacion[]> {
    const res = await axios.get(`${this.baseUrl}/hospitalizaciones`);
    return res.data;
  }

  // === Consultas ===
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
}
