import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { BookingService } from './booking.service';
import { Payment, PaymentMethod } from '../models/payment.model';
import { Booking } from '../models/booking.model';

/** Backend POST /payments returns the payment plus the updated booking. */
interface PaymentRow {
  _id?: string;
  id?: string;
  referenceNumber: string;
  amount: number;
  method: PaymentMethod;
  status: Payment['status'];
  paidAt?: string;
  booking?: { _id?: string; paymentStatus?: Booking['paymentStatus']; amountPaid?: number; bookingNumber?: string } | string;
  user?: { name?: string } | string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private payments: Payment[] = [];

  private api = inject(ApiService);
  private bookings = inject(BookingService);

  readonly methods: { id: PaymentMethod; label: string; hint: string; icon: string }[] = [
    { id: 'gcash', label: 'GCash', hint: 'Most popular', icon: 'wallet-outline' },
    { id: 'maya', label: 'Maya', hint: 'Instant', icon: 'phone-portrait-outline' },
    { id: 'credit-card', label: 'Credit Card', hint: 'Visa, Mastercard', icon: 'card-outline' },
    { id: 'bank-transfer', label: 'Bank Transfer', hint: '1-2 business days', icon: 'business-outline' },
    { id: 'cash', label: 'Cash on the day', hint: 'Pay at the venue', icon: 'cash-outline' },
  ];

  getPayments(): Observable<Payment[]> {
    if (environment.useMockData) {
      return of([...this.payments]).pipe(delay(200));
    }
    // Admin view - rows include the populated booking + payer.
    return this.api
      .get<PaymentRow[]>('/payments', { limit: 100 })
      .pipe(map((rows) => rows.map((p) => this.mapPayment(p, undefined))));
  }

  /** Admin action - verify (paid) or refund a payment. */
  updatePaymentStatus(id: string, status: Payment['status']): Observable<Payment> {
    if (environment.useMockData) {
      const payment = this.payments.find((p) => p.id === id);
      if (!payment) return throwError(() => new Error('Payment not found'));
      payment.status = status;
      return of({ ...payment }).pipe(delay(300));
    }

    return this.api
      .put<PaymentRow>(`/payments/${id}`, { status })
      .pipe(map((row) => this.mapPayment(row, undefined)));
  }

  /** Mock charge in mock mode; a real gateway would slot in here (PayMongo etc). */
  pay(booking: Booking, amount: number, method: PaymentMethod): Observable<Payment> {
    if (amount <= 0) return throwError(() => new Error('Invalid amount'));
    if (!booking) return throwError(() => new Error('No booking to pay for'));

    if (environment.useMockData) {
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
          const updated = this.bookings.applyPayment(booking.id, amount);
          if (updated) booking.paymentStatus = updated.paymentStatus;
        })
      );
    }

    return this.api.post<PaymentRow>('/payments', { booking: booking.id, amount, method }).pipe(
      map((row) => this.mapPayment(row, booking)),
      tap((p) => {
        this.payments = [p, ...this.payments];
      })
    );
  }

  /** Normalize the row and copy the fresh booking state onto the caller's object. */
  private mapPayment(row: PaymentRow, booking: Booking | undefined): Payment {
    const rowBooking = row.booking && typeof row.booking === 'object' ? row.booking : undefined;
    if (booking && rowBooking) {
      booking.paymentStatus = rowBooking.paymentStatus ?? booking.paymentStatus;
      booking.amountPaid = rowBooking.amountPaid ?? booking.amountPaid;
    }
    const payer = row.user && typeof row.user === 'object' ? row.user : undefined;
    return {
      id: (row._id ?? row.id) as string,
      bookingId: (rowBooking?._id ?? booking?.id ?? '') as string,
      referenceNumber: row.referenceNumber,
      amount: row.amount,
      method: row.method,
      status: row.status,
      paidAt: row.paidAt,
      bookingNumber: rowBooking?.bookingNumber,
      customerName: payer?.name,
    };
  }
}
