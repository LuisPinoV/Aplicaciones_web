import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import {
  ConsultasService,
  Consulta,
} from 'src/app/core/servicios/consultas.service';
import { ConsultasCardComponent } from 'src/app/compartidos/componentes/consultas-card/consultas-card.component';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ConsultasCardComponent]
})
export class ConsultasPage implements OnInit {
  consultas: Consulta[] = [];
  paciente: Paciente | null = null;

  constructor(
    private consultasService: ConsultasService,
    private pacienteStore: PacienteStoreService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente() ?? null;
    if (!this.paciente) {
      this.router.navigate(['/login']);
      return;
    }
    this.consultasService.getPorPaciente(this.paciente.idFichaMedica).subscribe({
      next: (data) => {
        this.consultas = data;
      },
      error: (err) => console.error('Error cargando consultas:', err)
    });
  }

  getInitials(nombre: string | undefined): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }
}