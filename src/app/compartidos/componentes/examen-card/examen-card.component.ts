import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Examen } from 'src/app/core/servicios/examenes.service';

@Component({
  selector: 'app-examen-card',
  templateUrl: './examen-card.component.html',
  styleUrls: ['./examen-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ExamenCardComponent implements OnInit {
  @Input() examen?: Examen;
  @Input() index?: number;

  constructor() {}

  ngOnInit() {}

  // 🔹 Clase CSS según estado del examen
  getEstadoClass(): string {
    if (!this.examen) return '';
    return this.examen.estado === 'Completado' ? 'status-completed' : 'status-pending';
  }

  // 🔹 Icono representativo según estado
  getExamenIcon(): string {
    if (!this.examen) return 'document-text-outline';
    return this.examen.estado === 'Completado' ? 'checkmark-circle-outline' : 'hourglass-outline';
  }

  // 🔹 Texto amigable del estado
  getEstadoTexto(): string {
    if (!this.examen) return 'Desconocido';
    return this.examen.estado === 'Completado' ? 'Completado' : 'Pendiente';
  }

  // 🔹 Color del badge de estado
  getEstadoBadgeColor(): string {
    if (!this.examen) return 'medium';
    return this.examen.estado === 'Completado' ? 'success' : 'warning';
  }

  // 🔹 Verificar si el valor cumple con la referencia
  verificarValor(valor: string, referencia: string): string {
    // Convertimos los valores a números para comparar
    const valorNumerico = parseFloat(valor);
    
    // Procesamos la referencia
    // Casos posibles: "< 5", "> 10", "5-10", "= 7"
    const ref = referencia.trim();
    
    if (ref.includes('-')) {
      // Caso rango: "5-10"
      const [min, max] = ref.split('-').map(num => parseFloat(num));
      return (valorNumerico >= min && valorNumerico <= max) ? 'success' : 'danger';
    } else if (ref.includes('<')) {
      // Caso menor que: "< 5"
      const limite = parseFloat(ref.replace('<', ''));
      return valorNumerico < limite ? 'success' : 'danger';
    } else if (ref.includes('>')) {
      // Caso mayor que: "> 10"
      const limite = parseFloat(ref.replace('>', ''));
      return valorNumerico > limite ? 'success' : 'danger';
    } else if (ref.includes('=')) {
      // Caso igual a: "= 7"
      const esperado = parseFloat(ref.replace('=', ''));
      return valorNumerico === esperado ? 'success' : 'danger';
    }
    
    return 'primary'; // valor por defecto si no coincide ningún patrón
  }
}
