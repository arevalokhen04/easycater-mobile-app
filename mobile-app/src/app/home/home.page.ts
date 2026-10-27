import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { PackageService } from '../core/services/package.service';
import { MenuService } from '../core/services/menu.service';
import { BookingService } from '../core/services/booking.service';
import { NotificationService } from '../core/services/notification.service';
import { CateringPackage } from '../core/models/package.model';
import { MenuItem } from '../core/models/menu-item.model';
import { Booking } from '../core/models/booking.model';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  greeting = '';
  // Signals, not plain fields: this app runs zoneless, so a plain property
  // assigned inside subscribe() would never reach the view.
  readonly popular = signal<CateringPackage[]>([]);
  readonly featured = signal<MenuItem[]>([]);
  readonly nextBooking = signal<Booking | undefined>(undefined);
  unread = 0;
  readonly loading = signal(true);

  constructor(
    private auth: AuthService,
    private packages: PackageService,
    private menu: MenuService,
    private bookings: BookingService,
    private notifications: NotificationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.greeting = this.buildGreeting();
    this.unread = this.notifications.unread();

    this.packages.getPopular().subscribe((list) => {
      this.popular.set(list.slice(0, 4));
      this.maybeDone();
    });

    this.menu.getFeatured().subscribe((list) => {
      this.featured.set(list.slice(0, 4));
      this.maybeDone();
    });

    this.bookings.getUpcoming().subscribe((list) => {
      this.nextBooking.set(list[0]);
      this.maybeDone();
    });
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  openPackage(pkg: CateringPackage): void {
    this.router.navigate(['/package-details', pkg.id]);
  }

  private maybeDone(): void {
    // three independent requests; hide the skeleton once at least two land
    if (this.popular().length && this.featured().length) this.loading.set(false);
  }

  private buildGreeting(): string {
    const hour = new Date().getHours();
    const salutation = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const firstName = this.auth.user()?.name?.split(' ')[0] ?? 'there';
    return `${salutation}, ${firstName}`;
  }
}



