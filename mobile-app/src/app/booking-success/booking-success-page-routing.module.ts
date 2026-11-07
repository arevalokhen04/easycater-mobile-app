import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BookingSuccessPage } from './booking-success.page';

const routes: Routes = [{ path: '', component: BookingSuccessPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingSuccessPageRoutingModule {}
