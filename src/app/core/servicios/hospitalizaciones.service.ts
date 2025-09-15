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
}
