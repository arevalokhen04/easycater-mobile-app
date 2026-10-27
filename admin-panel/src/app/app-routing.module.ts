import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadChildren: () => import('./login/login-page.module').then((m) => m.LoginPageModule),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./admin-shell/admin-shell-page.module').then((m) => m.AdminShellPageModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
