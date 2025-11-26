import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, FichaMedica } from 'src/app/services/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fichas-medicas',
  templateUrl: './fichas-medicas.page.html',
  styleUrls: ['./fichas-medicas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FichasMedicasPage implements OnInit, OnDestroy {
  fichasmedicas: FichaMedica[] = [];
  fichasSub!: Subscription;
  limit = 20;
  offset = 0;
  allDataLoaded = false;
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.fichasSub = this.apiService.fichas$.subscribe(data => {
      this.fichasmedicas = data;
    });

    await this.loadInitialFichas();
  }

  ngOnDestroy() {
    this.fichasSub?.unsubscribe();
  }

  async loadInitialFichas() {
    this.isLoading = true;
    try {
      await this.apiService.getFichasPaginadas(this.limit, this.offset);
    } finally {
      this.isLoading = false;
      this.cdRef.detectChanges();
    }
  }

  async loadFichasMedicas(event: any) {
    const res = await this.apiService.getFichasPaginadas(this.limit, this.offset);
    this.offset = res.pagination?.nextOffset || this.offset;
    this.allDataLoaded = !res.pagination?.hasMore;
    event.target.complete();

    if (this.allDataLoaded) {
      event.target.disabled = true;
    }

    this.cdRef.detectChanges();
  }

  trackById(index: number, ficha: FichaMedica) {
    return ficha.idFichaMedica;
  }
}
