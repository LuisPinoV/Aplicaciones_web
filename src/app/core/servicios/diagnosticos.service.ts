import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';

export interface Diagnostico {
  idDiagnostico: number;
  fecha: string;
  enfermedad: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getDiagnosticos(idFichaMedica: number): Observable<Diagnostico[]> {
    return this.http.get<Diagnostico[]>(`${this.apiUrl}/pacientes/${idFichaMedica}/diagnosticos`)
      .pipe(
        map(diagnosticos => diagnosticos.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )),
        catchError(error => {
          console.error('Error al obtener diagnósticos:', error);
          return of([]);
        })
      );
  }

  getContadorPorPaciente(idFichaMedica: number): Observable<number> {
    return this.getDiagnosticos(idFichaMedica).pipe(
      map(diagnosticos => diagnosticos.length)
    );
  }
}