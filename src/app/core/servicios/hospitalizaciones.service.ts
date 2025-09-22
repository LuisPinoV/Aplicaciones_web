import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Hospitalizacion {
  id: number;
  idPaciente: number;
  fecha: string;
  duracion: string;
  institucionMedica: string;
  tipoHospitalizacion?: string;
  estado: string;
  gravedad: 'leve' | 'moderado' | 'grave';
  motivo: string;
  especialidad: string;
  medico: string;
  habitacion: string;
  fechaAlta?: string | null;
  observaciones?: string;
}

export interface HospitalizacionesResponse {
  hospitalizaciones: Hospitalizacion[];
  estadosHospitalizacion: string[];
  gravedadHospitalizacion: string[];
  tiposHospitalizacion: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HospitalizacionesService {
  private http = inject(HttpClient);
  private base = environment.servicios.hospitalizaciones;

  getPorPaciente(idPaciente: number): Observable<Hospitalizacion[]> {
    return this.http.get<Hospitalizacion[]>(`${this.base}?idPaciente=${idPaciente}`);
  }

  getTodas(): Observable<HospitalizacionesResponse> {
    return this.http.get<HospitalizacionesResponse>(this.base);
  }

  getPorId(id: number): Observable<Hospitalizacion> {
    return this.http.get<Hospitalizacion>(`${this.base}/${id}`);
  }

  crear(hospitalizacion: Omit<Hospitalizacion, 'id'>): Observable<Hospitalizacion> {
    return this.http.post<Hospitalizacion>(this.base, hospitalizacion);
  }

  actualizar(id: number, hospitalizacion: Partial<Hospitalizacion>): Observable<Hospitalizacion> {
    return this.http.put<Hospitalizacion>(`${this.base}/${id}`, hospitalizacion);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // Métodos de utilidad para filtros y estadísticas
  getPorEstado(estado: string): Observable<Hospitalizacion[]> {
    return this.http.get<Hospitalizacion[]>(`${this.base}?estado=${estado}`);
  }

  getPorGravedad(gravedad: string): Observable<Hospitalizacion[]> {
    return this.http.get<Hospitalizacion[]>(`${this.base}?gravedad=${gravedad}`);
  }

  getActivas(): Observable<Hospitalizacion[]> {
    return this.http.get<Hospitalizacion[]>(`${this.base}?estado=Activa`);
  }

  getRecientes(dias: number = 30): Observable<Hospitalizacion[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);
    const fechaStr = fechaLimite.toISOString().split('T')[0];
    return this.http.get<Hospitalizacion[]>(`${this.base}?fecha_gte=${fechaStr}`);
  }

  // Métodos de utilidad para el componente
  static calcularTiempoTranscurrido(fecha: string): string {
    const fechaHospitalizacion = new Date(fecha);
    const hoy = new Date();
    const diferenciaMilisegundos = hoy.getTime() - fechaHospitalizacion.getTime();
    const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 1) return 'Hoy';
    if (diferenciaDias === 1) return 'Hace 1 día';
    if (diferenciaDias < 30) return `Hace ${diferenciaDias} días`;
    
    const diferenciaMeses = Math.floor(diferenciaDias / 30);
    if (diferenciaMeses === 1) return 'Hace 1 mes';
    if (diferenciaMeses < 12) return `Hace ${diferenciaMeses} meses`;
    
    const diferenciaAnios = Math.floor(diferenciaDias / 365);
    if (diferenciaAnios === 1) return 'Hace 1 año';
    return `Hace ${diferenciaAnios} años`;
  }

  static obtenerClaseEstado(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activa':
      case 'en curso':
        return 'activo';
      case 'finalizada':
      case 'completada':
        return 'resuelto';
      case 'suspendida':
      case 'en evaluación':
        return 'cronico';
      default:
        return 'activo';
    }
  }

  static obtenerIconoPorEspecialidad(especialidad: string): string {
    const iconos: { [key: string]: string } = {
      'cardiología': 'heart-outline',
      'neurología': 'brain-outline',
      'traumatología': 'bone-outline',
      'cirugía general': 'cut-outline',
      'medicina interna': 'medical-outline',
      'pediatría': 'baby-outline',
      'ginecología': 'female-outline',
      'urología': 'male-outline',
      'oftalmología': 'eye-outline',
      'otorrinolaringología': 'ear-outline',
      'dermatología': 'hand-left-outline',
      'psiquiatría': 'happy-outline'
    };
    
    return iconos[especialidad?.toLowerCase()] || 'business-outline';
  }
}