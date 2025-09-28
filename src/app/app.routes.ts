import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'agendamiento-medico',
    loadComponent: () => import('./agendamiento-medico/agendamiento-medico.page').then( m => m.AgendamientoMedicoPage)
  },
  {
    path: 'agendamiento-no-medico',
    loadComponent: () => import('./agendamiento-no-medico/agendamiento-no-medico.page').then( m => m.AgendamientoNoMedicoPage)
  },
  {
    path: 'ficha-medica/diagnosticos',
    loadComponent: () => import('./pages/diagnosticos/diagnosticos.page').then( m => m.DiagnosticosPage)
  },
  {
    path: 'ficha-medica/hospitalizaciones',
    loadComponent: () => import('./pages/hospitalizaciones/hospitalizaciones.page').then( m => m.HospitalizacionesPage)
  },
  {
    path: 'ficha-medica/consultas',
    loadComponent: () => import('./pages/consultas/consultas.page').then( m => m.ConsultasPage)
  },
  {
    path: 'ficha-medica/alergias',
    loadComponent: () => import('./pages/alergias/alergias.page').then( m => m.AlergiasPage)
  },
  {
    path: 'ficha-medica/procedimientos',
    loadComponent: () => import('./pages/procedimientos/procedimientos.page').then( m => m.ProcedimientosPage)
  },
  {
    path: 'ficha-medica/medicamentos',
    loadComponent: () => import('./pages/medicamentos/medicamentos.page').then( m => m.MedicamentosPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  }
];
