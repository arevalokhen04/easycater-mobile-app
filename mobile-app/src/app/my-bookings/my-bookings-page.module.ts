import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { MyBookingsPage } from './my-bookings.page';
import { MyBookingsPageRoutingModule } from './my-bookings-page-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, MyBookingsPageRoutingModule],
  declarations: [MyBookingsPage],
})
export class MyBookingsPageModule {}




