import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { Booking, BookingStatus } from '../models/booking.model';
import { MOCK_BOOKINGS, MOCK_PACKAGES } from '../data/mock-data';
import { BookingDraft, CANCEL_CUTOFF_HOURS, LEAD_DAYS, minBookingDate } from './cart.service';

export interface CancelCheck {
  allowed: boolean;
  /** Human-readable reason shown next to a disabled Cancel button. */
  reason: string | null;
}

/** Today's date at midnight, local time (toISOString would shift a day in UTC+ zones). */
export function todayLocalISO(): string {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Combines "2026-11-12" + "4:00 PM" into a local Date for the event start. */
export function eventStart(b: { eventDate: string; eventTime: string }): Date {
  const [y, m, d] = b.eventDate.slice(0, 10).split('-').map(Number);
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(b.eventTime);
  let hours = 0;
  let minutes = 0;
  if (match) {
    hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') hours += 12;
    minutes = Number(match[2]);
  }
  return new Date(y, (m || 1) - 1, d || 1, hours, minutes);
}

interface BookingRow {
  _id?: string;
  id?: string;
  bookingNumber?: string;
  package?: { _id?: string; name?: string; image?: string } | string;
  packageId?: string;
  packageName?: string;
  packageImage?: string;
  eventType?: string;
  eventDate?: string;
  eventTime?: string;
  guestCount?: number;
  venue?: string;
  address?: string;
  notes?: string;
  addOns?: { menuItem?: { _id?: string } | string; name: string; price: number; quantity: number }[];
  subtotal?: number;
  serviceCharge?: number;
  tax?: number;
  total?: number;
  status?: BookingStatus;
  paymentStatus?: Booking['paymentStatus'];
  amountPaid?: number;
  createdAt?: string;
}

/** Backend rows use Mongo _id + populated package - normalize to the app model. */
function mapBooking(raw: BookingRow): Booking {
  const pkg = raw.package && typeof raw.package === 'object' ? raw.package : undefined;
  return {
    id: (raw._id ?? raw.id) as string,
    bookingNumber: raw.bookingNumber ?? '',
    packageId: (pkg?._id ?? raw.packageId ?? '') as string,
    packageName: pkg?.name ?? raw.packageName,
    packageImage: pkg?.image ?? raw.packageImage,
    eventType: raw.eventType ?? 'other',
    eventDate: String(raw.eventDate ?? '').slice(0, 10),
    eventTime: raw.eventTime ?? '',
    guestCount: raw.guestCount ?? 0,
    venue: raw.venue ?? '',
    address: raw.address ?? '',
    notes: raw.notes,
    addOns: (raw.addOns ?? []).map((a) => ({
      menuItemId: ((typeof a.menuItem === 'object' ? a.menuItem?._id : a.menuItem) ?? '') as string,
      name: a.name,
      price: a.price,
      quantity: a.quantity,
    })),
    subtotal: raw.subtotal ?? 0,
    serviceCharge: raw.serviceCharge ?? 0,
    tax: raw.tax ?? 0,
    total: raw.total ?? 0,
    status: raw.status ?? 'pending',
    paymentStatus: raw.paymentStatus ?? 'unpaid',
    amountPaid: raw.amountPaid ?? 0,
    createdAt: raw.createdAt,
  };
}

/**
 * Bookings. In mock mode (environment.useMockData) it serves an in-memory
 * store so the app runs before the API is connected; otherwise every call
 * goes to the backend, which owns the booking rules (7-day lead time, one
 * event per day, complete details, cancellation cut-off, paid-is-locked).
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  /** In-memory store so newly created bookings appear in My Bookings (mock mode). */
  private bookings: Booking[] = MOCK_BOOKINGS.map((b) => this.withTotals(b));

  private api = inject(ApiService);

  getBookings(): Observable<Booking[]> {
    if (environment.useMockData) {
      return of([...this.bookings].sort((a, b) => b.eventDate.localeCompare(a.eventDate))).pipe(delay(250));
    }

    return this.api
      .get<BookingRow[]>('/bookings', { limit: 100 })
      .pipe(map((rows) => rows.map(mapBooking)));
  }

  getUpcoming(): Observable<Booking[]> {
    const today = todayLocalISO();
    return this.getBookings().pipe(
      map((list) =>
        list
          .filter((b) => b.eventDate.slice(0, 10) >= today && b.status !== 'cancelled')
          // Soonest first so "Next event" on Home really is the next one.
          .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
      )
    );
  }

  /** Dates (YYYY-MM-DD) that already hold an active booking - one event per day. */
  getTakenDates(): Observable<string[]> {
    if (environment.useMockData) {
      return of(this.takenDates()).pipe(delay(200));
    }

    return this.api.get<string[]>('/bookings/taken-dates');
  }

  private takenDates(): string[] {
    const today = todayLocalISO();
    return Array.from(
      new Set(
        this.bookings
          .filter((b) => b.status !== 'cancelled' && b.eventDate.slice(0, 10) >= today)
          .map((b) => b.eventDate.slice(0, 10))
      )
    ).sort();
  }

  private isDateTaken(date: string): boolean {
    return this.bookings.some(
      (b) => b.status !== 'cancelled' && b.eventDate.slice(0, 10) === date
    );
  }

  private formatDateLabel(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  getById(id: string): Observable<Booking | undefined> {
    if (environment.useMockData) {
      return of(this.bookings.find((b) => b.id === id)).pipe(delay(150));
    }

    return this.api
      .get<BookingRow>(`/bookings/${id}`)
      .pipe(
        map(mapBooking),
        catchError(() => of(undefined))
      );
  }

  create(draft: BookingDraft, totals: { subtotal: number; serviceCharge: number; tax: number; total: number }): Observable<Booking> {
    if (!draft.package) return throwError(() => new Error('Select a package first'));
    if (!draft.eventDate) return throwError(() => new Error('Choose an event date'));
    if (!draft.venue.trim()) return throwError(() => new Error('Enter the venue name to continue'));
    if (!draft.address.trim()) return throwError(() => new Error('Enter the venue address to continue'));

    const date = draft.eventDate.slice(0, 10);
    const earliest = minBookingDate();
    if (date < earliest) {
      return throwError(
        () => new Error(`Events must be booked at least ${LEAD_DAYS} days ahead - the earliest date is ${earliest}`)
      );
    }

    // One event per day - a date with an active booking is fully booked (mock mode).
    if (environment.useMockData && this.isDateTaken(date)) {
      return throwError(
        () => new Error(`${this.formatDateLabel(date)} is already fully booked - please choose another date`)
      );
    }

    if (environment.useMockData) {
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
        venue: draft.venue,
        address: draft.address,
        notes: draft.notes,
        addOns: draft.addOns,
        ...totals,
        status: 'pending',
        paymentStatus: 'unpaid',
        amountPaid: 0,
        createdAt: new Date().toISOString(),
      };

      return of(booking).pipe(
        delay(600),
        tap((created) => this.bookings = [created, ...this.bookings])
      );
    }

    // The backend enforces every rule and computes the authoritative totals.
    return this.api
      .post<BookingRow>('/bookings', {
        package: draft.packageId,
        eventDate: date,
        eventTime: draft.eventTime,
        guestCount: draft.guestCount,
        venue: draft.venue,
        address: draft.address,
        notes: draft.notes,
        eventType: draft.eventType,
        addOns: draft.addOns.map((a) => ({ menuItem: a.menuItemId, quantity: a.quantity })),
      })
      .pipe(map(mapBooking));
  }

  /**
   * Cancellation rules (mock mode): bookings with any payment are locked, and
   * cancellations close CANCEL_CUTOFF_HOURS before the event starts. In API
   * mode the backend enforces the same rules and answers with a message.
   */
  cancel(id: string): Observable<Booking> {
    if (environment.useMockData) {
      const booking = this.bookings.find((b) => b.id === id);
      if (!booking) return throwError(() => new Error('Booking not found'));

      const check = this.canCancel(booking);
      if (!check.allowed) {
        return throwError(() => new Error(check.reason ?? 'This booking can no longer be cancelled'));
      }

      booking.status = 'cancelled' as BookingStatus;
      return of({ ...booking }).pipe(delay(300));
    }

    return this.api
      .patch<BookingRow>(`/bookings/${id}/cancel`)
      .pipe(map(mapBooking));
  }

  /** UI helper - drives the disabled Cancel button and its explanation. */
  canCancel(b: Booking): CancelCheck {
    if (b.status === 'cancelled') return { allowed: false, reason: 'This booking is already cancelled' };
    if (b.status === 'completed') return { allowed: false, reason: 'Completed bookings can no longer be cancelled' };
    if ((b.amountPaid ?? 0) > 0 || b.paymentStatus === 'paid' || b.paymentStatus === 'partial') {
      return {
        allowed: false,
        reason: 'Locked - this booking is fixed: details and cancellation can no longer be changed',
      };
    }
    const cutoffMs = CANCEL_CUTOFF_HOURS * 60 * 60 * 1000;
    if (eventStart(b).getTime() - Date.now() <= cutoffMs) {
      return {
        allowed: false,
        reason: `Cancellation closed - events can only be cancelled more than ${CANCEL_CUTOFF_HOURS} hours before the start time`,
      };
    }
    return { allowed: true, reason: null };
  }

  /** Synchronous store update (mock mode) - mirrors the backend aggregation. */
  applyPayment(bookingId: string, amount: number): Booking | undefined {
    const booking = this.bookings.find((b) => b.id === bookingId);
    // Fully paid bookings are locked - additional payments are ignored.
    if (!booking || amount <= 0 || booking.paymentStatus === 'paid') return booking;

    booking.amountPaid = (booking.amountPaid ?? 0) + amount;
    booking.paymentStatus = booking.amountPaid >= booking.total ? 'paid' : 'partial';
    return booking;
  }

  remainingBalance(b: Booking): number {
    return Math.max(b.total - (b.amountPaid ?? 0), 0);
  }

  /** Mirrors the backend's 10% service charge + 12% tax formula (mock mode). */
  private withTotals(b: Booking): Booking {
    const addOnsTotal = b.addOns.reduce((s, a) => s + a.price * a.quantity, 0);
    const base = b.subtotal || addOnsTotal;
    const serviceCharge = Math.round(base * 0.1);
    const tax = Math.round((base + serviceCharge) * 0.12);
    const total = base + serviceCharge + tax;
    const amountPaid =
      b.paymentStatus === 'paid' ? total : b.paymentStatus === 'partial' ? Math.round(total / 2) : 0;
    return { ...b, subtotal: base, serviceCharge, tax, total, amountPaid };
  }

  /** Exposed for pages that want to show which package a booking refers to. */
  packageOf(booking: Booking) {
    return MOCK_PACKAGES.find((p) => p.id === booking.packageId);
  }
}
