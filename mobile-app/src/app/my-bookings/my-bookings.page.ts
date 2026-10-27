import { Component, OnInit, signal } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

import { BookingService } from '../core/services/booking.service';
import { Booking, BookingStatus } from '../core/models/booking.model';

type Filter = 'all' | 'upcoming' | 'completed' | 'cancelled';

@Component({
  selector: 'app-my-bookings',
  standalone: false,
  templateUrl: './my-bookings.page.html',
  styleUrls: ['./my-bookings.page.scss'],
})
export class MyBookingsPage implements OnInit {
  readonly filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  readonly bookings = signal<Booking[]>([]);
  readonly activeFilter = signal<Filter>('all');
  readonly loading = signal(true);

  constructor(
    private service: BookingService,
    private alert: AlertController,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    this.load();
  }

  setFilter(key: Filter): void {
    this.activeFilter.set(key);
  }

  get visible(): Booking[] {
    const today = new Date().toISOString().slice(0, 10);
    const bookings = this.bookings();

    switch (this.activeFilter()) {
      case 'upcoming':
        return bookings.filter(
          (b) => b.status !== 'cancelled' && b.status !== 'completed' && b.eventDate.slice(0, 10) >= today
        );
      case 'completed':
        return bookings.filter((b) => b.status === 'completed');
      case 'cancelled':
        return bookings.filter((b) => b.status === 'cancelled');
      default:
        return bookings;
    }
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  statusClass(status: BookingStatus): string {
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

  paymentClass(paid: string): string {
    return paid === 'paid' ? 'ok' : paid === 'partial' ? 'wait' : '';
  }

  async cancel(booking: Booking): Promise<void> {
    const alert = await this.alert.create({
      header: 'Cancel booking?',
      message: `${booking.packageName} on ${new Date(booking.eventDate).toLocaleDateString()} will be cancelled.`,
      buttons: [
        { text: 'Keep it', role: 'cancel' },
        {
          text: 'Cancel booking',
          role: 'destructive',
          handler: () => {
            this.service.cancel(booking.id).subscribe(() => {
              this.load();
              this.notify('Booking cancelled');
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private load(): void {
    this.loading.set(true);
    this.service.getBookings().subscribe((list) => {
      this.bookings.set(list);
      this.loading.set(false);
    });
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, position: 'bottom' });
    await t.present();
  }
}



