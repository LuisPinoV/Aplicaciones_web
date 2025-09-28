import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export interface ValorExamen {
  parametro: string;
  valor: string;
  referencia: string;
}

export interface Examen {
  id: number;
  idPaciente: number;
  nombre: string;
  fecha: string;
  estado: 'Pendiente' | 'Completado';
  resultado?: string;
  valores?: ValorExamen[];
}

@Injectable({
  providedIn: 'root'
})
export class ExamenesService {
  private apiUrl = environment.servicios.examenes;

  constructor(private http: HttpClient) { }

  getPorPaciente(pacienteId: number): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.apiUrl}?idPaciente=${pacienteId}`);
  }

  getContadorPorPaciente(pacienteId: number): Observable<number> {
    return this.getPorPaciente(pacienteId).pipe(
      map(examenes => examenes.length)
    );
  }

  crearExamen(examen: Omit<Examen, 'id'>): Observable<Examen> {
    return this.http.post<Examen>(this.apiUrl, examen);
  }
}
