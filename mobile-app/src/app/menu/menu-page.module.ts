import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { MenuPage } from './menu.page';
import { MenuPageRoutingModule } from './menu-page-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, MenuPageRoutingModule],
  declarations: [MenuPage],
})
export class MenuPageModule {}



