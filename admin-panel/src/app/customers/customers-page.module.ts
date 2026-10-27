import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { CustomersAdminPage } from './customers.page';
import { CustomersAdminPageRoutingModule } from './customers-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, CustomersAdminPageRoutingModule],
  declarations: [CustomersAdminPage],
})
export class CustomersAdminPageModule {}

