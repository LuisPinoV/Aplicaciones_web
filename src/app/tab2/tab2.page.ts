import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonItem, IonInput, IonLabel, IonButton, IonDatetime } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class Tab2Page {
  ficha = {
    Rut: 0,
    nombre: '',
    fechaNacimiento: '',
    sexo: '',
    tipoSangre: '',
    altura: undefined,
    peso: undefined,
    genero: ''
  };

  constructor(private api: ApiService) {}
    async guardarFicha() {
    try {
      const res = await this.api.crearFicha(this.ficha);
      if (res.success) {
        alert(`Ficha creada con ID: ${res.idFichaMedica}`);
        this.ficha = { Rut: 0, nombre: '', fechaNacimiento: '', sexo: '', tipoSangre: '', altura: undefined, peso: undefined, genero: '' };
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar la ficha');
    }
  }
}