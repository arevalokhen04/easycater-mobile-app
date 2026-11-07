import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BookingService } from '../core/services/booking.service';
import { CartService } from '../core/services/cart.service';
import { Booking } from '../core/models/booking.model';

/**
 * Receipt screen (Nielsen #1 - conclusive confirmation): shows the booking
 * number, what was paid, the remaining balance and the lock notice.
 */
@Component({
  selector: 'app-booking-success',
  standalone: false,
  templateUrl: './booking-success.page.html',
  styleUrls: ['./booking-success.page.scss'],
})
export class BookingSuccessPage implements OnInit {
  receipt: { booking: Booking; paidNow: number; reference: string } | null = null;

  constructor(
    private cart: CartService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.receipt = this.cart.completedBooking();
    if (!this.receipt) {
      // Nothing to show (e.g. deep link or refresh) - bookings is the safe landing.
      this.router.navigateByUrl('/tabs/bookings', { replaceUrl: true });
    }
  }

  get booking(): Booking | null {
    return this.receipt?.booking ?? null;
  }

  get paidNow(): number {
    return this.receipt?.paidNow ?? 0;
  }

  get reference(): string {
    return this.receipt?.reference ?? '';
  }

  get remaining(): number {
    const b = this.booking;
    return b ? this.bookingService.remainingBalance(b) : 0;
  }

  get paidInFull(): boolean {
    return this.remaining === 0;
  }

  get paidAtLabel(): string {
    return new Date().toLocaleString('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  viewBookings(): void {
    this.router.navigateByUrl('/tabs/bookings');
  }

  backHome(): void {
    this.router.navigateByUrl('/tabs/home');
  }
}
