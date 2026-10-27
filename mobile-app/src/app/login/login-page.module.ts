import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { LoginPage } from './login.page';
import { LoginPageRoutingModule } from './login-page-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, LoginPageRoutingModule],
  declarations: [LoginPage],
})
export class LoginPageModule {}



