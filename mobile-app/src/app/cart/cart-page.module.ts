import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { CartPage } from './cart.page';
import { CartPageRoutingModule } from './cart-page-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, CartPageRoutingModule],
  declarations: [CartPage],
})
export class CartPageModule {}



