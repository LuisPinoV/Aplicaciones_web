import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Diagnostico } from 'src/app/core/servicios/diagnosticos.service';

@Component({
  selector: 'app-diagnostico-card',
  templateUrl: './diagnostico-card.component.html',
  styleUrls: ['./diagnostico-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DiagnosticoCardComponent {
  @Input() diagnostico?: Diagnostico;
}
