import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export interface Consulta {
  idConsulta: number;
  fecha: string;
  institucionMedica: string;
  motivo: string;
  medico: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPorPaciente(idFichaMedica: number): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.apiUrl}/pacientes/${idFichaMedica}/consultas`);
  }

  getContadorPorPaciente(idFichaMedica: number): Observable<number> {
    return this.getPorPaciente(idFichaMedica).pipe(
      map(consultas => consultas.length)
    );
  }
}