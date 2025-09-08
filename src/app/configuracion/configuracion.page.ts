import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonToggle, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { IonButtons, IonMenuButton } from '@ionic/angular/standalone';


@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonToggle, IonButton, RouterLink, IonButtons, IonMenuButton]
})
export class ConfiguracionPage implements OnInit {

  constructor() { }

  ngOnInit() { }

}