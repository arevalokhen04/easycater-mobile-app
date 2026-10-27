import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { BookingsAdminPage } from './bookings.page';
import { BookingsAdminPageRoutingModule } from './bookings-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, BookingsAdminPageRoutingModule],
  declarations: [BookingsAdminPage],
})
export class BookingsAdminPageModule {}

