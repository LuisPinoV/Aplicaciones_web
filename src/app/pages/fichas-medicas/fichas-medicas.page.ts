import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonInfiniteScroll } from '@ionic/angular/standalone';
import { ApiService, FichaMedica } from 'src/app/services/api';

@Component({
  selector: 'app-fichas-medicas',
  templateUrl: './fichas-medicas.page.html',
  styleUrls: ['./fichas-medicas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FichasMedicasPage implements OnInit {
  private allFichas: FichaMedica[] = []; // Almacena TODAS las fichas
  fichasmedicas: FichaMedica[] = [];     // Fichas que se muestran en la UI
  isLoading = false;
  private currentPage = 0;
  private readonly pageSize = 20;
  allDataLoaded = false;

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
    this.isLoading = true;
    this.allDataLoaded = false;
    this.fichasmedicas = [];
    this.currentPage = 0;

    try {
      // 1. Obtenemos TODAS las fichas del backend de una sola vez
      this.allFichas = await this.apiService.getAllFichas();
      
      // 2. Cargamos la primera "página" de datos localmente
      this.cargarSiguientePaginaLocal();

    } catch (err) {
      console.error('Error cargando la lista completa de fichas:', err);
    } finally {
      this.isLoading = false;
    }
  }

  loadFichasMedicas(event?: any) {
    // Este método ahora solo opera sobre los datos locales
    this.cargarSiguientePaginaLocal();

    if (event) {
      event.target.complete();
    }
  }

  private cargarSiguientePaginaLocal() {
    if (this.allDataLoaded) {
      return;
    }

    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Sacamos el siguiente trozo del array completo
    const nuevasFichas = this.allFichas.slice(startIndex, endIndex);

    if (nuevasFichas.length > 0) {
      this.fichasmedicas.push(...nuevasFichas);
      this.currentPage++;
    }

    // Si ya no hay más fichas que mostrar, desactivamos el scroll
    if (this.fichasmedicas.length >= this.allFichas.length) {
      this.allDataLoaded = true;
      if (this.infiniteScroll) {
        this.infiniteScroll.disabled = true;
      }
    }
  }
}
