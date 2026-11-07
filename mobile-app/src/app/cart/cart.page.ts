import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { BookingService } from '../core/services/booking.service';
import { CartService } from '../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  readonly creating = signal(false);

  constructor(
    public cart: CartService,
    private bookings: BookingService,
    private router: Router,
    private alert: AlertController,
    private loading: LoadingController,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    if (!this.cart.hasItems()) {
      this.router.navigateByUrl('/tabs/packages', { replaceUrl: true });
    }
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  packageLineTotal(): number {
    const d = this.cart.state();
    return d.package ? d.package.pricePerHead * d.guestCount : 0;
  }

  async removeAddon(menuItemId: string, name: string): Promise<void> {
    const alert = await this.alert.create({
      header: 'Remove item?',
      message: `${name} will be removed from your order.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => this.cart.removeItem(menuItemId),
        },
      ],
    });
    await alert.present();
  }

  /**
   * Creates the pending (unpaid) booking, then moves to payment. From here on
   * the booking exists in My Bookings - payment locks it against cancellation.
   */
  async proceed(): Promise<void> {
    if (this.creating()) return;

    // A pending booking for this exact order already exists - just continue.
    if (this.cart.activeBooking()) {
      this.router.navigateByUrl('/payment');
      return;
    }

    this.creating.set(true);
    const loader = await this.loading.create({ message: 'Creating your booking...' });
    await loader.present();

    this.bookings.create(this.cart.state(), this.cart.totals()).subscribe({
      next: (booking) => {
        this.cart.setActiveBooking(booking);
        this.creating.set(false);
        loader.dismiss();
        this.router.navigateByUrl('/payment');
      },
      error: (err: Error) => {
        this.creating.set(false);
        loader.dismiss();
        this.notify(err?.message || 'Could not create the booking. Please check your details.');
      },
    });
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2400, position: 'bottom' });
    await t.present();
  }
}
