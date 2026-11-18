import { Component, ViewChild } from '@angular/core';
import { AlertController, IonMenu } from '@ionic/angular';

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

  /** Bottom tab bar (phones/tablets) - the four most-used screens. */
  readonly tabLinks = [
    { path: '/dashboard', label: 'Home', icon: 'grid-outline' },
    { path: '/bookings', label: 'Bookings', icon: 'calendar-outline' },
    { path: '/payments', label: 'Payments', icon: 'card-outline' },
    { path: '/customers', label: 'Customers', icon: 'people-outline' },
    { path: '/reports', label: 'Reports', icon: 'bar-chart-outline' },
  ];

  constructor(
    public auth: AuthService,
    private alert: AlertController
  ) {}

  get adminName(): string {
    return this.auth.user()?.name ?? 'Administrator';
  }

  /** Closes the overlay menu on mobile once a link is tapped. */
  close(): void {
    void this.menu?.close();
  }

  /** Confirmation dialog before signing out - Cancel / Logout. */
  async confirmLogout(): Promise<void> {
    const alert = await this.alert.create({
      header: 'Log out?',
      message: 'You will need to sign in again to access the admin panel.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Logout', role: 'destructive', handler: () => this.auth.logout() },
      ],
    });
    await alert.present();
  }
}
