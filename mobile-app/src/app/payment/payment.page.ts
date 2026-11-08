import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { CartService } from '../core/services/cart.service';
import { PaymentService } from '../core/services/payment.service';
import { BookingService } from '../core/services/booking.service';
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

  constructor(
    public cart: CartService,
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private notifications: NotificationService,
    private router: Router,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    // Payment always targets the pending booking created at the Cart step.
    const booking = this.cart.activeBooking();
    if (!booking) {
      this.router.navigateByUrl('/tabs/bookings', { replaceUrl: true });
      return;
    }
    if (booking.paymentStatus === 'paid') {
      this.notify('This booking is already fully paid.');
      this.router.navigateByUrl('/tabs/bookings', { replaceUrl: true });
      return;
    }
    this.payInFull.set(true);
    this.amount.set(this.targetTotal);
  }

  /** Getter, not a field - see the note in ProfilePage. */
  get methods() {
    return this.paymentService.methods;
  }

  get booking(): Booking | null {
    return this.cart.activeBooking();
  }

  /** Back goes to the cart mid-flow, but to bookings when paying from there. */
  get backHref(): string {
    return this.cart.hasItems() ? '/cart' : '/tabs/bookings';
  }

  /** True when the booking already has a downpayment and only the balance is left. */
  get payingBalance(): boolean {
    const b = this.booking;
    return !!b && b.paymentStatus === 'partial';
  }

  get targetTotal(): number {
    const b = this.booking;
    if (!b) return 0;
    return this.payingBalance
      ? this.bookingService.remainingBalance(b)
      : b.total;
  }

  get alreadyPaid(): number {
    return this.booking?.amountPaid ?? 0;
  }

  get downPayment(): number {
    const b = this.booking;
    return b ? Math.round(b.total / 2) : 0;
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  selectMethod(id: PaymentMethod): void {
    this.selectedMethod.set(id);
  }

  setPayInFull(value: boolean): void {
    this.payInFull.set(value);
    this.amount.set(value ? this.targetTotal : this.downPayment);
  }

  async confirm(): Promise<void> {
    if (this.submitting()) return;
    const booking = this.booking;
    const max = this.targetTotal;
    const amount = this.amount();
    if (!booking) {
      this.notify('No booking to pay for');
      return;
    }
    if (booking.paymentStatus === 'paid') {
      this.notify('This booking is already fully paid and locked.');
      return;
    }
    if (amount <= 0 || amount > max) {
      this.notify(`The amount to pay is fixed - it must be between PHP 1 and ${this.currency(max)}`);
      return;
    }

    // Inline button state instead of a blocking overlay - no stuck backdrops.
    this.submitting.set(true);

    this.paymentService.pay(booking, amount, this.selectedMethod()).subscribe({
      next: (payment) => {
        this.submitting.set(false);

        this.notifications.push({
          title: 'Payment received',
          message: `Payment ${payment.referenceNumber} received. Booking ${booking.bookingNumber} is now pending confirmation.`,
          type: 'payment',
        });

        // Hand the receipt to the success screen before wiping the draft.
        this.cart.setCompletedBooking({
          booking: { ...booking },
          paidNow: amount,
          reference: payment.referenceNumber,
        });
        this.cart.clear();
        this.router.navigateByUrl('/booking-success', { replaceUrl: true });
      },
      error: () => {
        // Everything the user picked stays intact (Nielsen #9 - keep their work).
        this.submitting.set(false);
        this.notify('Payment did not go through. Your booking is safe - please try again.');
      },
    });
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2200, position: 'bottom' });
    await t.present();
  }
}
