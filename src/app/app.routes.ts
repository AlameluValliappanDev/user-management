import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'users/new',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/user-detail/user-detail.component').then(m => m.UserDetailComponent)
  },
  {
    path: 'users/:id/edit',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  { path: '**', redirectTo: 'users' }
];
