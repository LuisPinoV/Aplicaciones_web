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
}
