import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { ReportsAdminPage } from './reports.page';
import { ReportsAdminPageRoutingModule } from './reports-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ReportsAdminPageRoutingModule],
  declarations: [ReportsAdminPage],
})
export class ReportsAdminPageModule {}

