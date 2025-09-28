import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Paciente {
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

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/pacientes`);
  }

  getPacientePorRut(rut: string): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/pacientes/rut/${rut}`);
  }
}
