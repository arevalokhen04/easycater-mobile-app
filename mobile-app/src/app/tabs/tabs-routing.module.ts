import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home-page.module').then((m) => m.HomePageModule),
      },
      {
        path: 'packages',
        loadChildren: () => import('../packages/packages-page.module').then((m) => m.PackagesPageModule),
      },
      {
        path: 'menu',
        loadChildren: () => import('../menu/menu-page.module').then((m) => m.MenuPageModule),
      },
      {
        path: 'bookings',
        loadChildren: () =>
          import('../my-bookings/my-bookings-page.module').then((m) => m.MyBookingsPageModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile-page.module').then((m) => m.ProfilePageModule),
      },
      { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
