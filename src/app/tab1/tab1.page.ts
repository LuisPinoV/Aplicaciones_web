import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,            // <--- Esto indica que es standalone
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule,
    DatePipe                    // <--- Para usar el pipe 'date'
  ]
})
export class Tab1Page implements OnInit {

  ficha: any;
  diagnosticos: any[] = [];
  hospitalizaciones: any[] = [];
  consultas: any[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    try {
      const fichas = await this.apiService.getFichas();

      if (fichas && fichas.length > 0) {
        this.ficha = fichas[0];
        this.diagnosticos = [];
        this.hospitalizaciones = [];
        this.consultas = [];
      }

      this.loading = false;
    } catch (error) {
      console.error('Error cargando la ficha:', error);
      this.loading = false;
    }
  }
}
