import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Procedimiento {
  id: number;
  idPaciente: number;
  nombre: string;
  tipo: string;
  fecha: string;
  medico: string;
  institucion: string;
  resultado: string;
}

@Injectable({
  providedIn: 'root'
})

export class ProcedimientosService {
  private apiUrl = environment.servicios.procedimientos;

  constructor(private http: HttpClient) { }

  getPorPaciente(pacienteId: number): Observable<Procedimiento[]> {
    return this.http.get<Procedimiento[]>(`${this.apiUrl}?idPaciente=${pacienteId}`);
  }
}