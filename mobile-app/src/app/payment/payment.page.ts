import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { CartService } from '../core/services/cart.service';
import { BookingService } from '../core/services/booking.service';
import { PaymentService } from '../core/services/payment.service';
import { NotificationService } from '../core/services/notification.service';
import { PaymentMethod } from '../core/models/payment.model';
import { Booking } from '../core/models/booking.model';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  readonly selectedMethod = signal<PaymentMethod>('gcash');
  readonly payInFull = signal(true);
  readonly amount = signal(0);
  readonly submitting = signal(false);
  readonly createdBooking = signal<Booking | undefined>(undefined);

  constructor(
    public cart: CartService,
    private paymentService: PaymentService,
    private bookings: BookingService,
    private notifications: NotificationService,
    private router: Router,
    private loading: LoadingController,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    if (!this.cart.hasItems()) {
      this.router.navigateByUrl('/tabs/packages', { replaceUrl: true });
      return;
    }
    this.amount.set(this.cart.totals().total);
  }

  /** Getter, not a field - see the note in ProfilePage. */
  get methods() {
    return this.paymentService.methods;
  }

  get downPayment(): number {
    return Math.round(this.cart.totals().total / 2);
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  selectMethod(id: PaymentMethod): void {
    this.selectedMethod.set(id);
  }

  setPayInFull(value: boolean): void {
    this.payInFull.set(value);
    this.amount.set(value ? this.cart.totals().total : this.downPayment);
  }

  async confirm(): Promise<void> {
    if (this.submitting()) return;
    const amount = this.amount();
    if (amount <= 0 || amount > this.cart.totals().total) {
      this.notify('Enter an amount within the order total');
      return;
    }

    this.submitting.set(true);
    const loader = await this.loading.create({ message: 'Processing payment...' });
    await loader.present();

    const draft = this.cart.state();
    const totals = this.cart.totals();

    this.bookings.create(draft, totals).subscribe((booking) => {
      this.paymentService.pay(booking, amount, this.selectedMethod()).subscribe({
        next: (payment) => {
          this.createdBooking.set({ ...booking, paymentStatus: booking.paymentStatus });
          this.submitting.set(false);
          loader.dismiss();

          this.notifications.push({
            title: 'Booking confirmed',
            message: `Payment ${payment.referenceNumber} received. Booking ${booking.bookingNumber} is now pending confirmation.`,
            type: 'payment',
          });

          this.cart.clear();
          this.notify('Payment successful');
          this.router.navigateByUrl('/tabs/bookings', { replaceUrl: true });
        },
        error: () => {
          this.submitting.set(false);
          loader.dismiss();
          this.notify('Payment failed. Please try again.');
        },
      });
    });
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2200, position: 'bottom' });
    await t.present();
  }
}



