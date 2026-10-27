import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { ProfilePage } from './profile.page';
import { ProfilePageRoutingModule } from './profile-page-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ProfilePageRoutingModule],
  declarations: [ProfilePage],
})
export class ProfilePageModule {}



