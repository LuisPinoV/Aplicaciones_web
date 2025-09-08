import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonTextarea, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { IonButtons, IonMenuButton } from '@ionic/angular/standalone';


@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonTextarea, IonButton, RouterLink, IonButtons, IonMenuButton]
})
export class ContactoPage implements OnInit {

  constructor() { }

  ngOnInit() { }

}
