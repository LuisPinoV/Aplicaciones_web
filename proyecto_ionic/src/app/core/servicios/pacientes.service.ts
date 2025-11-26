import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Paciente {
  id: number;
  rut: string;
  nombre: string;
  edad: number;
  sexo: string;
  grupo_sanguineo: string;
  telefono: string;
  mail: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private http = inject(HttpClient);
  private base = environment.servicios.pacientes;

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.base);
  }

  getPacientePorRut(rut: string): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.base}?rut=${rut}`);
  }
}
