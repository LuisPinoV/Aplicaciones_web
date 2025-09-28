import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export interface Medicamento {
  nombre: string;
  descripcion: string;
  cantidad: number;
  formato: string;
  tiempoConsumo: number;
  frecuenciaConsumo: string;
  fechaInicio: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicamentosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPorPaciente(idFichaMedica: number): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(`${this.apiUrl}/pacientes/${idFichaMedica}/medicamentos`);
  }

  getContadorPorPaciente(idFichaMedica: number): Observable<number> {
    return this.getPorPaciente(idFichaMedica).pipe(
      map(medicamentos => medicamentos.length)
    );
  }
}