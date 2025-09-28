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
    path: 'tabs/historial/diagnosticos',
    loadComponent: () => import('./pages/diagnosticos/diagnosticos.page').then( m => m.DiagnosticosPage)
  },
  {
    path: 'tabs/historial/hospitalizaciones',
    loadComponent: () => import('./pages/hospitalizaciones/hospitalizaciones.page').then( m => m.HospitalizacionesPage)
  },
  {
    path: 'tabs/historial/consultas',
    loadComponent: () => import('./pages/consultas/consultas.page').then( m => m.ConsultasPage)
  },
  {
    path: 'tabs/historial/alergias',
    loadComponent: () => import('./pages/alergias/alergias.page').then( m => m.AlergiasPage)
  },
  {
    path: 'tabs/historial/procedimientos',
    loadComponent: () => import('./pages/procedimientos/procedimientos.page').then( m => m.ProcedimientosPage)
  },
  {
    path: 'tabs/historial/medicamentos',
    loadComponent: () => import('./pages/medicamentos/medicamentos.page').then( m => m.MedicamentosPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'editar-perfil',
    loadComponent: () => import('./pages/editar-perfil/editar-perfil.page').then( m => m.EditarPerfilPage)
  }

];
