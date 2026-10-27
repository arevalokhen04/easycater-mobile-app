import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PaymentsAdminPage } from './payments.page';

const routes: Routes = [{ path: '', component: PaymentsAdminPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentsAdminPageRoutingModule {}

