import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminShellPage } from './admin-shell.page';

const routes: Routes = [
  {
    path: '',
    component: AdminShellPage,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../dashboard/dashboard-page.module').then((m) => m.DashboardPageModule),
      },
      {
        path: 'packages',
        loadChildren: () =>
          import('../packages/packages-page.module').then((m) => m.PackagesAdminPageModule),
      },
      {
        path: 'menu',
        loadChildren: () => import('../menu/menu-page.module').then((m) => m.MenuAdminPageModule),
      },
      {
        path: 'bookings',
        loadChildren: () =>
          import('../bookings/bookings-page.module').then((m) => m.BookingsAdminPageModule),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('../payments/payments-page.module').then((m) => m.PaymentsAdminPageModule),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('../customers/customers-page.module').then((m) => m.CustomersAdminPageModule),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('../reports/reports-page.module').then((m) => m.ReportsAdminPageModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminShellRoutingModule {}
