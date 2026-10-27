import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-page-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, HomePageRoutingModule],
  declarations: [HomePage],
})
export class HomePageModule {}



