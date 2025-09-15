import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Hospitalizacion } from 'src/app/core/servicios/hospitalizaciones.service';

@Component({
  selector: 'app-hospitalizacion-card',
  templateUrl: './hospitalizacion-card.component.html',
  styleUrls: ['./hospitalizacion-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HospitalizacionCardComponent {
  @Input() hospitalizacion?: Hospitalizacion;
}
