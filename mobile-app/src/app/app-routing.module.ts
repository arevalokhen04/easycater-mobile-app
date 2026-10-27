import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // Public
  {
    path: 'login',
    canActivate: [guestGuard],
    loadChildren: () => import('./login/login-page.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadChildren: () => import('./register/register-page.module').then((m) => m.RegisterPageModule),
  },

  // Authenticated shell with bottom tabs
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },

  // Full-screen flows pushed above the tabs
  {
    path: 'package-details/:id',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./package-details/package-details-page.module').then((m) => m.PackageDetailsPageModule),
  },
  {
    path: 'booking',
    canActivate: [authGuard],
    loadChildren: () => import('./booking/booking-page.module').then((m) => m.BookingPageModule),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadChildren: () => import('./cart/cart-page.module').then((m) => m.CartPageModule),
  },
  {
    path: 'payment',
    canActivate: [authGuard],
    loadChildren: () => import('./payment/payment-page.module').then((m) => m.PaymentPageModule),
  },

  { path: '', redirectTo: 'tabs/home', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
