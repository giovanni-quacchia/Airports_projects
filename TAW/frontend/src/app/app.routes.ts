// app.routes.ts
import { Routes } from '@angular/router';
import { adminGuard } from './admin/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: 'search', loadComponent: () => import('./search/search.page').then(m => m.SearchPage) },
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent) },
  { path: 'purchase', loadComponent: () => import('./purchase/purchase.page').then(m => m.PurchasePage) },

  { path: 'seat-selection', loadComponent: () => import('./purchase/seat-selection.page').then(m => m.SeatSelectionPage) },
  { path: 'compagnia',loadComponent: () => import('./compagnia/compagnia.page').then(m => m.CompagniaPage) },

  { path: 'admin', canActivate: [adminGuard],
    loadComponent: () => import('./admin/admin.page').then(m => m.AdminPage) },

  { path: '**', redirectTo: 'search' }
];
