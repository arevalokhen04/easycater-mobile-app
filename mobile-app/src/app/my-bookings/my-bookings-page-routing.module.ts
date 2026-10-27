import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MyBookingsPage } from './my-bookings.page';

const routes: Routes = [{ path: '', component: MyBookingsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyBookingsPageRoutingModule {}



