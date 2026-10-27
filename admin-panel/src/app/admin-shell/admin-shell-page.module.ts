import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { RouterModule } from '@angular/router';

import { AdminShellPage } from './admin-shell.page';
import { AdminShellRoutingModule } from './admin-shell-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, AdminShellRoutingModule],
  declarations: [AdminShellPage],
})
export class AdminShellPageModule {}
