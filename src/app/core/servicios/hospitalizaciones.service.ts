import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export interface Hospitalizacion {
  idHospitalizacion: number;
  idFichaMedica: number;
  fecha: string;
  duracion: number;
  institucionMedica: string;
}

@Injectable({
  providedIn: 'root'
})
export class HospitalizacionesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPorPaciente(idFichaMedica: number): Observable<Hospitalizacion[]> {
    return this.http.get<Hospitalizacion[]>(`${this.apiUrl}/pacientes/${idFichaMedica}/hospitalizaciones`);
  }

  getContadorPorPaciente(idFichaMedica: number): Observable<number> {
    return this.getPorPaciente(idFichaMedica).pipe(
      map(hospitalizaciones => hospitalizaciones.length)
    );
  }
}