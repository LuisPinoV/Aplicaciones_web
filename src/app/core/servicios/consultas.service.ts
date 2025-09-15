import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Consultas {
  id: number;
  idPaciente: number;
  fecha: string;
  institucionMedica: string;
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
}
