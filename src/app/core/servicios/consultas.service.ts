import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export interface Consultas {
  id: number;
  idPaciente: number;
  fecha: string;
  institucionMedica: string;
  especialidad?: string;
  medico?: string;
  motivo?: string;
  estado?: string;
  prioridad?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  private http = inject(HttpClient);
  private base = environment.servicios.consultas;

  getPorPaciente(idPaciente: number): Observable<Consultas[]> {
    return this.http.get<Consultas[]>(`${this.base}?idPaciente=${idPaciente}`);
  }

  getById(id: number): Observable<Consultas> {
    return this.http.get<Consultas>(`${this.base}/${id}`);
  }

  crear(consulta: Omit<Consultas, 'id'>): Observable<Consultas> {
    return this.http.post<Consultas>(this.base, consulta);
  }

  actualizar(id: number, consulta: Partial<Consultas>): Observable<Consultas> {
    return this.http.put<Consultas>(`${this.base}/${id}`, consulta);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getContadorPorPaciente(pacienteId: number): Observable<number> {
    return this.getPorPaciente(pacienteId).pipe(
      map(consultas => consultas.length)
    );
  }
}