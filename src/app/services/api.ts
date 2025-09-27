import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl = 'http://localhost:3000';

  async getFichas() {
    const res = await axios.get(`${this.baseUrl}/fichas`);
    return res.data;
  }

  async getFichasDetalle() {
    const res = await axios.get(`${this.baseUrl}/fichas-detalle`);
    return res.data;
  }

  async crearFicha(ficha: any) {
  const res = await axios.post(`${this.baseUrl}/fichas`, ficha);
  return res.data;
}
}

