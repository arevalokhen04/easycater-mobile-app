import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { MenuAdminPage } from './menu.page';
import { MenuAdminPageRoutingModule } from './menu-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, MenuAdminPageRoutingModule],
  declarations: [MenuAdminPage],
})
export class MenuAdminPageModule {}

