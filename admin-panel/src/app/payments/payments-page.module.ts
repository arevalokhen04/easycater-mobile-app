import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { PaymentsAdminPage } from './payments.page';
import { PaymentsAdminPageRoutingModule } from './payments-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PaymentsAdminPageRoutingModule],
  declarations: [PaymentsAdminPage],
})
export class PaymentsAdminPageModule {}

