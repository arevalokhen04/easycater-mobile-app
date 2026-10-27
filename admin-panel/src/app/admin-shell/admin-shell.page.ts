import { Component, ViewChild } from '@angular/core';
import { IonMenu } from '@ionic/angular';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.page.html',
  styleUrls: ['./admin-shell.page.scss'],
  standalone: false,
})
export class AdminShellPage {
  @ViewChild(IonMenu) menu?: IonMenu;

  readonly links = [
    { path: '/dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { path: '/packages', label: 'Packages', icon: 'cube-outline' },
    { path: '/menu', label: 'Menu', icon: 'restaurant-outline' },
    { path: '/bookings', label: 'Bookings', icon: 'calendar-outline' },
    { path: '/payments', label: 'Payments', icon: 'card-outline' },
    { path: '/customers', label: 'Customers', icon: 'people-outline' },
    { path: '/reports', label: 'Reports', icon: 'bar-chart-outline' },
  ];

  constructor(public auth: AuthService) {}

  get adminName(): string {
    return this.auth.user()?.name ?? 'Administrator';
  }

  /** Closes the overlay menu on mobile once a link is tapped. */
  close(): void {
    void this.menu?.close();
  }
}
