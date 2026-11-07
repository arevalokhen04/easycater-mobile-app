import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { PackagesPage } from './packages.page';
import { PackagesPageRoutingModule } from './packages-page-routing.module';
import { SharedComponentsModule } from '../core/components/shared-components.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PackagesPageRoutingModule, SharedComponentsModule],
  declarations: [PackagesPage],
})
export class PackagesPageModule {}



