import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonTitle, IonToolbar, IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';

@Component({
  selector: 'app-agendamiento-no-medico',
  templateUrl: './agendamiento-no-medico.page.html',
  styleUrls: ['./agendamiento-no-medico.page.scss'],
  standalone: true,
  imports: [IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonCol, IonGrid, IonRow
  ]
})
export class AgendamientoNoMedicoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

export class ExampleComponent {}