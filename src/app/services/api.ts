import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor() {}

  // === Fichas médicas ===
  async getFichas() {
    const res = await axios.get(`${this.baseUrl}/fichas`);
    return res.data;
  }

  // Si en tu backend tienes un endpoint que devuelve todas las fichas con detalle
  async getFichasDetalle() {
    const res = await axios.get(`${this.baseUrl}/fichas-detalle`);
    return res.data;
  }

  // Crear una nueva ficha
  async crearFicha(ficha: any) {
    const res = await axios.post(`${this.baseUrl}/fichas`, ficha);
    return res.data;
  }

  // === NUEVO: ficha completa (con diagnósticos, consultas, etc.) ===
  async getFichaCompleta(id: number) {
    const res = await axios.get(`${this.baseUrl}/fichas/${id}`);
    return res.data; // { ficha, diagnosticos, hospitalizaciones, consultas }
  }
}
