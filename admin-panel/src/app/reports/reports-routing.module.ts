import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportsAdminPage } from './reports.page';

const routes: Routes = [{ path: '', component: ReportsAdminPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsAdminPageRoutingModule {}

