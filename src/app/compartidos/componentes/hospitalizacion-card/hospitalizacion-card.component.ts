import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Hospitalizacion, HospitalizacionesService } from 'src/app/core/servicios/hospitalizaciones.service';

@Component({
  selector: 'app-hospitalizacion-card',
  templateUrl: './hospitalizacion-card.component.html',
  styleUrls: ['./hospitalizacion-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HospitalizacionCardComponent {
  @Input() hospitalizacion!: Hospitalizacion;

  constructor(private hospitalizacionesService: HospitalizacionesService) {}

  getDuracionTranscurrida(): string {
    if (!this.hospitalizacion) return '';
    const fechaHospitalizacion = new Date(this.hospitalizacion.fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaHospitalizacion.getTime();
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    if (dias > 1) return `Hace ${dias} días`;
    if (dias === 1) return `Hace 1 día`;
    return 'Hoy';
  }

  getHospitalizacionIcon(): string {
    return 'business-outline';
  }
}