import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})

export class Tab1Page implements OnInit {

  fichas: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarFichas();
  }

  async cargarFichas() {
    this.fichas = await this.api.getFichasDetalle(); // trae datos completos
    console.log(this.fichas);
  }
}