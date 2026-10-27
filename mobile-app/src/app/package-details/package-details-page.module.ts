import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { PackageDetailsPage } from './package-details.page';
import { PackageDetailsPageRoutingModule } from './package-details-page-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PackageDetailsPageRoutingModule],
  declarations: [PackageDetailsPage],
})
export class PackageDetailsPageModule {}




