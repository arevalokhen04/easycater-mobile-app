import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BookingsAdminPage } from './bookings.page';

const routes: Routes = [{ path: '', component: BookingsAdminPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingsAdminPageRoutingModule {}

