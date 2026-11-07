import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { BookingSuccessPage } from './booking-success.page';
import { BookingSuccessPageRoutingModule } from './booking-success-page-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, BookingSuccessPageRoutingModule],
  declarations: [BookingSuccessPage],
})
export class BookingSuccessPageModule {}
