import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { PackagesAdminPage } from './packages.page';
import { PackagesAdminPageRoutingModule } from './packages-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PackagesAdminPageRoutingModule],
  declarations: [PackagesAdminPage],
})
export class PackagesAdminPageModule {}

