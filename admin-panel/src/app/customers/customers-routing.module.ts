import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CustomersAdminPage } from './customers.page';

const routes: Routes = [{ path: '', component: CustomersAdminPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomersAdminPageRoutingModule {}

