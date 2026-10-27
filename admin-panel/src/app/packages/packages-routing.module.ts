import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackagesAdminPage } from './packages.page';

const routes: Routes = [{ path: '', component: PackagesAdminPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackagesAdminPageRoutingModule {}

