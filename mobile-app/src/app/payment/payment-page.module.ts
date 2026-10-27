import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { PaymentPage } from './payment.page';
import { PaymentPageRoutingModule } from './payment-page-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PaymentPageRoutingModule],
  declarations: [PaymentPage],
})
export class PaymentPageModule {}



