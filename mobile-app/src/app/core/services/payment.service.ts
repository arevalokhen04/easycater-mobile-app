import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { Payment, PaymentMethod } from '../models/payment.model';
import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private payments: Payment[] = [];

  readonly methods: { id: PaymentMethod; label: string; hint: string; icon: string }[] = [
    { id: 'gcash', label: 'GCash', hint: 'Most popular', icon: 'wallet-outline' },
    { id: 'maya', label: 'Maya', hint: 'Instant', icon: 'phone-portrait-outline' },
    { id: 'credit-card', label: 'Credit Card', hint: 'Visa, Mastercard', icon: 'card-outline' },
    { id: 'bank-transfer', label: 'Bank Transfer', hint: '1-2 business days', icon: 'business-outline' },
    { id: 'cash', label: 'Cash on the day', hint: 'Pay at the venue', icon: 'cash-outline' },
  ];

  getPayments(): Observable<Payment[]> {
    return of([...this.payments]).pipe(delay(200));
  }

  /** Mock charge - a real implementation would call a gateway (PayMongo etc). */
  pay(booking: Booking, amount: number, method: PaymentMethod): Observable<Payment> {
    if (amount <= 0) return throwError(() => new Error('Invalid amount'));
    if (!booking) return throwError(() => new Error('No booking to pay for'));

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      bookingId: booking.id,
      referenceNumber: `PAY-${Date.now().toString().slice(-10)}`,
      amount,
      method,
      status: 'paid',
      paidAt: new Date().toISOString(),
    };

    return of(payment).pipe(
      delay(900),
      tap((p) => {
        this.payments = [p, ...this.payments];
        booking.paymentStatus = amount >= booking.total ? 'paid' : 'partial';
      })
    );
  }
}
