import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService, Hospitalizacion, FichaMedica } from 'src/app/services/api';

@Component({
  selector: 'app-hospitalizaciones',
  templateUrl: './hospitalizaciones.page.html',
  styleUrls: ['./hospitalizaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, DatePipe]
})
export class HospitalizacionesPage implements OnInit {
  ficha?: FichaMedica;
  hospitalizaciones: Hospitalizacion[] = [];
  isLoading = true;

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    try {
      // Aquí deberías tener el id de la ficha médica a consultar
      const idFicha = 1; // Cambiar según tu lógica o recibirlo por parámetro/route
      this.hospitalizaciones = await this.apiService.getHospitalizacionesPorFicha(idFicha);
    } catch (error) {
      console.error('Error cargando hospitalizaciones:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
