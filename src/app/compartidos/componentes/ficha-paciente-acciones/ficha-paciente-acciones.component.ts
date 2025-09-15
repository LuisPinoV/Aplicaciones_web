import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ficha-paciente-acciones',
  templateUrl: './ficha-paciente-acciones.component.html',
  styleUrls: ['./ficha-paciente-acciones.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FichaPacienteAccionesComponent {

  constructor(
    private router: Router
  ) {}

  ngOnInit() {}

  irADiagnosticos() {
    console.log('Click en botón Ver diagnósticos');
    this.router.navigate(['/ficha-medica/diagnosticos']).then(success => {
      console.log('Resultado navegación:', success);
    });
  }

  irAHospitalizaciones() {
    console.log('Click en botón Ver hospitalizaciones');
    this.router.navigate(['/ficha-medica/hospitalizaciones']).then(success => {
      console.log('Resultado navegación:', success);
    });
  }

  irAConsultas() {
    console.log('Click en botón Ver consultas');
    this.router.navigate(['/ficha-medica/consultas']).then(success => {
      console.log('Resultado navegación:', success);
    });
  }

  irAProcedimientos() {
    console.log('Click en botón Ver procedimientos');
    this.router.navigate(['/ficha-medica/procedimienos']).then(success => {
      console.log('Resultado navegación:', success);
    });
  }

  irAMedicamentos() {
    console.log('Click en botón Ver medicamentos');
    this.router.navigate(['/ficha-medica/medicamentos']).then(success => {
      console.log('Resultado navegación:', success);
    });
  }

}
