import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export interface Alergia {
  alergia: string;
  reaccion: string;
  fechaDiagnostico: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlergiasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPorPaciente(idFichaMedica: number): Observable<Alergia[]> {
    return this.http.get<Alergia[]>(`${this.apiUrl}/pacientes/${idFichaMedica}/padecimientos`);
  }

  getContadorPorPaciente(idFichaMedica: number): Observable<number> {
    return this.getPorPaciente(idFichaMedica).pipe(
      map(alergias => alergias.length)
    );
  }
}