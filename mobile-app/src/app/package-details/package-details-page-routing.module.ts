import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageDetailsPage } from './package-details.page';

const routes: Routes = [{ path: '', component: PackageDetailsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackageDetailsPageRoutingModule {}



