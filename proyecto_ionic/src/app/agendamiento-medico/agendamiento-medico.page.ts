import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, 
  IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-agendamiento-medico',
  templateUrl: './agendamiento-medico.page.html',
  styleUrls: ['./agendamiento-medico.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle]
})
export class AgendamientoMedicoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
export class ExampleComponent {}
