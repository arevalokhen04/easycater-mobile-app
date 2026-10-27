import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { BookingPage } from './booking.page';
import { BookingPageRoutingModule } from './booking-page-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, BookingPageRoutingModule],
  declarations: [BookingPage],
})
export class BookingPageModule {}



