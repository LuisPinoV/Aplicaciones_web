import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { IonButtons, IonMenuButton } from '@ionic/angular/standalone';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, RouterLink, IonButtons, IonMenuButton]
})
export class PerfilPage implements OnInit {

  constructor() { }

  ngOnInit() { }

}
