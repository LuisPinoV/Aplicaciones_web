import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'paciente/:rut',
    loadComponent: () => import('./paciente/paciente.page').then( m => m.PacientePage)
  },
  {
    path: 'paciente/:rut/diagnosticos',
    loadComponent: () => import('./diagnosticos/diagnosticos.page').then( m => m.DiagnosticosPage)
  },
  {
    path: 'crear-paciente',
    loadComponent: () => import('./crear-paciente/crear-paciente.page').then( m => m.CrearPacientePage)
  },
  {
    path: 'paciente/:rut/editar',
    loadComponent: () => import('./editar-paciente/editar-paciente.page').then( m => m.EditarPacientePage)
  },  {
    path: 'agendamiento-medico',
    loadComponent: () => import('./agendamiento-medico/agendamiento-medico.page').then( m => m.AgendamientoMedicoPage)
  },
  {
    path: 'agendamiento-no-medico',
    loadComponent: () => import('./agendamiento-no-medico/agendamiento-no-medico.page').then( m => m.AgendamientoNoMedicoPage)
  }

];
