import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { Booking, BookingStatus } from '../models/booking.model';
import { MOCK_BOOKINGS, MOCK_PACKAGES } from '../data/mock-data';
import { BookingDraft } from './cart.service';

@Injectable({ providedIn: 'root' })
export class BookingService {
  /** In-memory store so newly created bookings appear in My Bookings. */
  private bookings: Booking[] = MOCK_BOOKINGS.map((b) => this.withTotals(b));

  getBookings(): Observable<Booking[]> {
    return of([...this.bookings].sort((a, b) => b.eventDate.localeCompare(a.eventDate))).pipe(delay(250));
  }

  getUpcoming(): Observable<Booking[]> {
    const today = new Date().toISOString().slice(0, 10);
    return this.getBookings().pipe(
      map((list) =>
        list.filter(
          (b) => b.eventDate.slice(0, 10) >= today && b.status !== 'cancelled'
        )
      )
    );
  }

  getById(id: string): Observable<Booking | undefined> {
    return of(this.bookings.find((b) => b.id === id)).pipe(delay(150));
  }

  create(draft: BookingDraft, totals: { subtotal: number; serviceCharge: number; tax: number; total: number }): Observable<Booking> {
    if (!draft.package) return throwError(() => new Error('Select a package first'));
    if (!draft.eventDate) return throwError(() => new Error('Choose an event date'));

    const booking: Booking = {
      id: `b-${Date.now()}`,
      bookingNumber: `ECB-${Date.now().toString().slice(-8)}`,
      packageId: draft.package.id,
      packageName: draft.package.name,
      packageImage: draft.package.image,
      eventType: draft.eventType,
      eventDate: draft.eventDate as string,
      eventTime: draft.eventTime,
      guestCount: draft.guestCount,
      venue: draft.venue || 'To be confirmed',
      address: draft.address,
      notes: draft.notes,
      addOns: draft.addOns,
      ...totals,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    };

    return of(booking).pipe(
      delay(600),
      tap((created) => this.bookings = [created, ...this.bookings])
    );
  }

  cancel(id: string): Observable<Booking | undefined> {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return throwError(() => new Error('Booking not found'));

    booking.status = 'cancelled' as BookingStatus;
    return of({ ...booking }).pipe(delay(300));
  }

  /** Mirrors the backend's 10% service charge + 12% tax formula. */
  private withTotals(b: Booking): Booking {
    const addOnsTotal = b.addOns.reduce((s, a) => s + a.price * a.quantity, 0);
    const base = b.subtotal || addOnsTotal;
    const serviceCharge = Math.round(base * 0.1);
    const tax = Math.round((base + serviceCharge) * 0.12);
    return { ...b, subtotal: base, serviceCharge, tax, total: base + serviceCharge + tax };
  }

  /** Exposed for pages that want to show which package a booking refers to. */
  packageOf(booking: Booking) {
    return MOCK_PACKAGES.find((p) => p.id === booking.packageId);
  }
}
