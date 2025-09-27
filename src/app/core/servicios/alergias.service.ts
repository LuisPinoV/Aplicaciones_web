import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Alergia {
  id: number;
  idPaciente: number;
  nombre: string;
  tipo: string;
  severidad: string;
  reaccion: string;
  fechaDiagnostico: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlergiasService {
  private apiUrl = environment.servicios.alergias;

  constructor(private http: HttpClient) { }

  getPorPaciente(pacienteId: number): Observable<Alergia[]> {
    return this.http.get<Alergia[]>(`${this.apiUrl}?idPaciente=${pacienteId}`);
  }
}