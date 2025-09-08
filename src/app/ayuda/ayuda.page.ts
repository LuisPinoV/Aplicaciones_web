import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { IonButtons, IonMenuButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ayuda',
  templateUrl: './ayuda.page.html',
  styleUrls: ['./ayuda.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, RouterLink, IonButtons, IonMenuButton]
})
export class AyudaPage implements OnInit {

  constructor() { }

  ngOnInit() { }

}
