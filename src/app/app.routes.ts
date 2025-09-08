import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./configuracion/configuracion.page').then( m => m.ConfiguracionPage)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./contacto/contacto.page').then( m => m.ContactoPage)
  },
  {
    path: 'ayuda',
    loadComponent: () => import('./ayuda/ayuda.page').then( m => m.AyudaPage)
  },
  {
    path: 'acerca',
    loadComponent: () => import('./acerca/acerca.page').then( m => m.AcercaPage)
  },
];
