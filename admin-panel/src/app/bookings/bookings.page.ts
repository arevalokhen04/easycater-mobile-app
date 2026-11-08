import { Component, OnInit, signal } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { AdminDataService } from '../core/services/admin-data.service';
import { AdminBooking } from '../core/models/admin.models';

@Component({
  selector: 'app-bookings-admin',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
  standalone: false,
})
export class BookingsAdminPage implements OnInit {
  readonly statuses = [
    'all',
    'pending',
    'confirmed',
    'preparing',
    'in-progress',
    'completed',
    'cancelled',
  ];

  readonly bookings = signal<AdminBooking[]>([]);
  readonly activeStatus = signal('all');
  readonly loading = signal(true);
  readonly busy = signal(false);

  constructor(
    private data: AdminDataService,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    this.load();
  }

  money(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('');
  }

  setStatus(status: string): void {
    this.activeStatus.set(status);
    this.load();
  }

  updateStatus(booking: AdminBooking, status: string): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.data.updateBookingStatus(booking.id, status).subscribe({
      next: () => {
        this.busy.set(false);
        this.load();
        this.notify(`${booking.bookingNumber} is now ${status}`);
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.notify(err.message);
      },
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'ok';
      case 'cancelled':
        return 'hot';
      case 'pending':
        return 'wait';
      case 'confirmed':
        return 'info';
      default:
        return 'soon';
    }
  }

  /** Next status a coordinator can move the booking to. */
  nextStatus(status: string): string | null {
    switch (status) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'in-progress';
      case 'in-progress':
        return 'completed';
      default:
        return null;
    }
  }

  private load(): void {
    this.loading.set(true);
    this.data.getBookings(this.activeStatus()).subscribe({
      next: (list) => {
        this.bookings.set(list);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.notify(err.message);
      },
    });
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2200, position: 'bottom' });
    await t.present();
  }
}
