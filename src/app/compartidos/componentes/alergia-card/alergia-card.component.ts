import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Alergia } from 'src/app/core/servicios/alergias.service';

@Component({
  selector: 'app-alergia-card',
  templateUrl: './alergia-card.component.html',
  styleUrls: ['./alergia-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class AlergiaCardComponent {
  @Input() alergia!: Alergia;

  constructor() {}
}