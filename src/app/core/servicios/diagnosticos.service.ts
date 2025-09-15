import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Diagnostico {
  id: number;
  idPaciente: number;
  nombre: string;
  codigo: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticosService {
  private http = inject(HttpClient);
  private base = environment.servicios.diagnosticos;

  getPorPaciente(idPaciente: number): Observable<Diagnostico[]> {
    return this.http.get<Diagnostico[]>(`${this.base}?idPaciente=${idPaciente}`);
  }
}
