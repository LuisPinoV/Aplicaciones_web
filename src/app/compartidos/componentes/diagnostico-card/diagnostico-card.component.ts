import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Diagnostico } from 'src/app/services/api';

@Component({
  selector: 'app-diagnostico-card',
  templateUrl: './diagnostico-card.component.html',
  styleUrls: ['./diagnostico-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DiagnosticoCardComponent {
  @Input() diagnostico!: Diagnostico;
  @Input() index?: number;

  getTiempoTranscurrido(): string {
    if (!this.diagnostico?.fecha) return '';

    const fechaDiagnostico = new Date(this.diagnostico.fecha);
    if (isNaN(fechaDiagnostico.getTime())) return 'Fecha inválida';

    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaDiagnostico.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);

    if (años > 0) return años === 1 ? 'Hace 1 año' : `Hace ${años} años`;
    if (meses > 0) return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
    if (dias > 0) return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
    return 'Hoy';
  }

  onMoreOptions() {
    console.log('Mostrar opciones para diagnóstico:', this.diagnostico);
  }
}
