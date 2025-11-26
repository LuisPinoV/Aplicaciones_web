import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators';

export interface Diagnostico {
  id: number;
  idPaciente: number;
  nombre: string;
  codigo: string;
  fecha: string;
  descripcion?: string;
  medico?: string;
  gravedad?: 'leve' | 'moderado' | 'grave';
  estado?: 'activo' | 'cronico' | 'resuelto' | 'en_tratamiento' | 'en_recuperacion' | 'estable' | 'seguimiento';
}

export interface EstadisticasDiagnosticos {
  total: number;
  recientes: number;
  activos: number;
  cronicos: number;
  resueltos: number;
  porGravedad: {
    leve: number;
    moderado: number;
    grave: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticosService {
  private http = inject(HttpClient);
  private base = environment.servicios.diagnosticos;

  getPorPaciente(idPaciente: number): Observable<Diagnostico[]> {
    return this.http.get<Diagnostico[]>(`${this.base}?idPaciente=${idPaciente}`)
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

  getContadorPorPaciente(pacienteId: number): Observable<number> {
    return this.getPorPaciente(pacienteId).pipe(
      map(diagnosticos => diagnosticos.length)
    );
  }

  getDiagnosticoById(id: number): Observable<Diagnostico | undefined> {
    return this.http.get<Diagnostico[]>(this.base).pipe(
      map(diagnosticos => diagnosticos.find(d => d.id === id)),
      catchError(error => {
        console.error('Error al obtener diagnóstico:', error);
        return of(undefined);
      })
    );
  }

  getEstadisticasPorPaciente(idPaciente: number): Observable<EstadisticasDiagnosticos> {
    return this.getPorPaciente(idPaciente).pipe(
      map(diagnosticos => {
        const ahora = new Date();
        const tresMesesAtras = new Date();
        tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

        const recientes = diagnosticos.filter(d => new Date(d.fecha) >= tresMesesAtras).length;
        const activos = diagnosticos.filter(d => 
          d.estado && ['activo', 'en_tratamiento', 'en_recuperacion'].includes(d.estado)
        ).length;
        const cronicos = diagnosticos.filter(d => d.estado === 'cronico').length;
        const resueltos = diagnosticos.filter(d => d.estado === 'resuelto').length;

        const porGravedad = {
          leve: diagnosticos.filter(d => d.gravedad === 'leve').length,
          moderado: diagnosticos.filter(d => d.gravedad === 'moderado').length,
          grave: diagnosticos.filter(d => d.gravedad === 'grave').length
        };

        return {
          total: diagnosticos.length,
          recientes,
          activos,
          cronicos,
          resueltos,
          porGravedad
        };
      })
    );
  }

  filtrarPorEstado(idPaciente: number, estado: string): Observable<Diagnostico[]> {
    return this.getPorPaciente(idPaciente).pipe(
      map(diagnosticos => {
        switch (estado) {
          case 'recientes':
            const tresMesesAtras = new Date();
            tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
            return diagnosticos.filter(d => new Date(d.fecha) >= tresMesesAtras);
          
          case 'activos':
            return diagnosticos.filter(d => 
              d.estado && ['activo', 'en_tratamiento', 'en_recuperacion'].includes(d.estado)
            );
          
          case 'cronicos':
            return diagnosticos.filter(d => d.estado === 'cronico');
          
          case 'resueltos':
            return diagnosticos.filter(d => d.estado === 'resuelto');
          
          default:
            return diagnosticos;
        }
      })
    );
  }

  filtrarPorGravedad(idPaciente: number, gravedad: 'leve' | 'moderado' | 'grave'): Observable<Diagnostico[]> {
    return this.getPorPaciente(idPaciente).pipe(
      map(diagnosticos => diagnosticos.filter(d => d.gravedad === gravedad))
    );
  }

  buscarDiagnosticos(idPaciente: number, termino: string): Observable<Diagnostico[]> {
    return this.getPorPaciente(idPaciente).pipe(
      map(diagnosticos => 
        diagnosticos.filter(d =>
          d.nombre.toLowerCase().includes(termino.toLowerCase()) ||
          d.codigo.toLowerCase().includes(termino.toLowerCase()) ||
          (d.descripcion && d.descripcion.toLowerCase().includes(termino.toLowerCase()))
        )
      )
    );
  }

  // Método para crear un nuevo diagnóstico
  crearDiagnostico(diagnostico: Omit<Diagnostico, 'id'>): Observable<Diagnostico> {
    return this.http.post<Diagnostico>(this.base, diagnostico);
  }

  // Método para actualizar un diagnóstico existente
  actualizarDiagnostico(id: number, diagnostico: Partial<Diagnostico>): Observable<Diagnostico> {
    return this.http.patch<Diagnostico>(`${this.base}/${id}`, diagnostico);
  }

  // Método para eliminar un diagnóstico
  eliminarDiagnostico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // Método utilitario para obtener el color asociado a una gravedad
  getColorPorGravedad(gravedad?: string): string {
    switch (gravedad) {
      case 'leve': return 'success';
      case 'moderado': return 'warning';
      case 'grave': return 'danger';
      default: return 'medium';
    }
  }

  // Método utilitario para obtener el color asociado a un estado
  getColorPorEstado(estado?: string): string {
    switch (estado) {
      case 'activo': return 'tertiary';
      case 'cronico': return 'warning';
      case 'resuelto': return 'success';
      case 'en_tratamiento': return 'primary';
      case 'en_recuperacion': return 'secondary';
      case 'estable': return 'medium';
      case 'seguimiento': return 'light';
      default: return 'medium';
    }
  }
}