import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { BookingService } from '../core/services/booking.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  readonly stats = signal({ total: 0, upcoming: 0, spent: 0 });
  readonly editing = signal(false);
  readonly editName = signal('');
  readonly editPhone = signal('');
  readonly editAddress = signal('');

  constructor(
    public auth: AuthService,
    public notificationService: NotificationService,
    private bookings: BookingService,
    private alert: AlertController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bookings.getBookings().subscribe((list) => {
      const today = new Date().toISOString().slice(0, 10);
      this.stats.set({
        total: list.length,
        upcoming: list.filter((b) => b.status !== 'cancelled' && b.eventDate.slice(0, 10) >= today).length,
        spent: list
          .filter((b) => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.total, 0),
      });
    });
  }

  get user() {
    return this.auth.user();
  }

  /**
   * Exposed as a getter, not a field: with ES2022 class fields the initialisers
   * run before constructor parameter properties are assigned.
   */
  get notifications() {
    return this.notificationService.notifications;
  }

  get initials(): string {
    const name = this.user?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.round(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  }

  startEdit(): void {
    const user = this.user;
    this.editName.set(user?.name ?? '');
    this.editPhone.set(user?.phone ?? '');
    this.editAddress.set(user?.address ?? '');
    this.editing.set(true);
  }

  saveEdit(): void {
    if (!this.editName().trim()) return;
    this.auth.updateProfile({
      name: this.editName().trim(),
      phone: this.editPhone().trim(),
      address: this.editAddress().trim(),
    });
    this.editing.set(false);
  }

  async logout(): Promise<void> {
    const alert = await this.alert.create({
      header: 'Log out?',
      message: 'You will need to sign in again to view your bookings.',
      buttons: [
        { text: 'Stay', role: 'cancel' },
        { text: 'Log out', role: 'destructive', handler: () => this.auth.logout() },
      ],
    });
    await alert.present();
  }

  goToBookings(): void {
    this.router.navigateByUrl('/tabs/bookings');
  }
}



