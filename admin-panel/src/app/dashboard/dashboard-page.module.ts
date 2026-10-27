import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';
import { DashboardPageRoutingModule } from './dashboard-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, DashboardPageRoutingModule],
  declarations: [DashboardPage],
})
export class DashboardPageModule {}

