import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MenuAdminPage } from './menu.page';

const routes: Routes = [{ path: '', component: MenuAdminPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuAdminPageRoutingModule {}

