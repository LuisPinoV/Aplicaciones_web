import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PacienteStoreService } from 'src/app/core/servicios/paciente-store.service';
import { Paciente } from 'src/app/core/servicios/pacientes.service';
import { AlergiasService, Alergia } from 'src/app/core/servicios/alergias.service';
import { AlergiaCardComponent } from 'src/app/compartidos/componentes/alergia-card/alergia-card.component';

@Component({
  selector: 'app-alergias',
  templateUrl: './alergias.page.html',
  styleUrls: ['./alergias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AlergiaCardComponent]
})
export class AlergiasPage implements OnInit {
  paciente?: Paciente;
  alergias: Alergia[] = [];

  constructor(
    private pacienteStore: PacienteStoreService,
    private alergiasService: AlergiasService,
    private router: Router
  ) {}

  ngOnInit() {
    this.paciente = this.pacienteStore.getPaciente();

    if (!this.paciente) {
      this.router.navigate(['/buscar']);
      return;
    }

    this.alergiasService.getPorPaciente(this.paciente.id).subscribe({
      next: (data) => (this.alergias = data),
      error: (err) => console.error('Error cargando alergias:', err)
    });
  }

  getInitials(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}