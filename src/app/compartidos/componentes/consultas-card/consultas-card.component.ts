import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Consultas } from 'src/app/core/servicios/consultas.service';

@Component({
  selector: 'app-consultas-card',
  templateUrl: './consultas-card.component.html',
  styleUrls: ['./consultas-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ConsultasCardComponent  {
  @Input() consultas?: Consultas;
}