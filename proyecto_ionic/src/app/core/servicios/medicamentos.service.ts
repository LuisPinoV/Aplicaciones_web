import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export interface Medicamento {
  id: number;
  idPaciente: number;
  nombre: string;
  dosis: string;
  via: string;
  frecuencia: string;
  motivo: string;
  estado: 'Activo' | 'Suspendido' | 'Finalizado';
  fechaInicio: string;
  fechaFin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicamentosService {
  private apiUrl = environment.servicios.medicamentos;

  constructor(private http: HttpClient) { }

  getPorPaciente(pacienteId: number): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(`${this.apiUrl}?idPaciente=${pacienteId}`);
  }

  getContadorPorPaciente(pacienteId: number): Observable<number> {
    return this.getPorPaciente(pacienteId).pipe(
      map(medicamentos => medicamentos.length)
    );
  }
}