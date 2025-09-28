import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export interface Procedimiento {
  nombre: string;
  descripcion: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})

export class ProcedimientosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPorPaciente(idFichaMedica: number): Observable<Procedimiento[]> {
    return this.http.get<Procedimiento[]>(`${this.apiUrl}/pacientes/${idFichaMedica}/procedimientos`);
  }

  getContadorPorPaciente(idFichaMedica: number): Observable<number> {
    return this.getPorPaciente(idFichaMedica).pipe(
      map(procedimientos => procedimientos.length)
    );
  }
}