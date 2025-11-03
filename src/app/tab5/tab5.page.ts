import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FichaPacienteCardComponent } from 'src/app/compartidos/componentes/ficha-paciente-card/ficha-paciente-card.component';
import { PerfilAccionesCardComponent } from 'src/app/compartidos/componentes/perfil-acciones-card/perfil-acciones-card.component';

interface Paciente {
  idUsuario: number;
  nombre: string;
  Rut: string;
  fechaNacimiento: string;
  sexo: string;
  tipoSangre: string;
}

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FichaPacienteCardComponent, PerfilAccionesCardComponent]
})
export class Tab5Page implements OnInit {
  paciente?: Paciente;

  constructor(private router: Router) {}

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
      try {
        this.paciente = JSON.parse(usuarioGuardado) as Paciente;
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
        this.paciente = undefined;
      }
    }

    if (!this.paciente) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
}
