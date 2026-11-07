import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Booking } from '../models/booking.model';
import { BookingDraft, minBookingDate } from './cart.service';
import { BookingService, eventStart } from './booking.service';

// These specs exercise the in-memory mock rules, not the HTTP client.
beforeEach(() => {
  environment.useMockData = true;
  // A fresh root injector per test keeps the in-memory booking store isolated.
  TestBed.resetTestingModule();
});

/** Builds a complete booking fixture; overrides via `patch`. */
function makeBooking(patch: Partial<Booking> = {}): Booking {
  const base: Booking = {
    id: 'b-test',
    bookingNumber: 'ECB-00000001',
    packageId: 'p-1',
    packageName: 'Kusina Classico',
    eventType: 'wedding',
    eventDate: isoInDays(10),
    eventTime: '4:00 PM',
    guestCount: 50,
    venue: 'Grand Ballroom',
    address: 'Rainbow Ave, Quezon City',
    addOns: [],
    subtotal: 42_500,
    serviceCharge: 4_250,
    tax: 5_610,
    total: 52_360,
    status: 'pending',
    paymentStatus: 'unpaid',
    amountPaid: 0,
  };
  return { ...base, ...patch };
}

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Date + "h:mm AM/PM" roughly `hoursFromNow` ahead - for cut-off cases. */
function soon(hoursFromNow: number): { eventDate: string; eventTime: string } {
  const d = new Date(Date.now() + hoursFromNow * 3_600_000);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const h12 = d.getHours() % 12 || 12;
  const suffix = d.getHours() >= 12 ? 'PM' : 'AM';
  return {
    eventDate: `${d.getFullYear()}-${month}-${day}`,
    eventTime: `${h12}:${`${d.getMinutes()}`.padStart(2, '0')} ${suffix}`,
  };
}

function makeDraft(patch: Partial<BookingDraft> = {}): BookingDraft {
  return {
    packageId: 'p-1',
    package: {
      id: 'p-1',
      name: 'Kusina Classico',
      slug: 'kusina-classico',
      description: '',
      pricePerHead: 850,
      minGuests: 50,
      maxGuests: 400,
      category: 'wedding',
      image: '',
      inclusions: [],
      isPopular: true,
      rating: 4.8,
    },
    guestCount: 50,
    addOns: [],
    eventType: 'wedding',
    eventDate: isoInDays(10),
    eventTime: '4:00 PM',
    venue: 'Grand Ballroom',
    address: 'Rainbow Ave, Quezon City',
    notes: '',
    ...patch,
  };
}

describe('BookingService rules', () => {
  it('allows cancelling an unpaid booking more than 2 hours before the event', () => {
    const service = TestBed.inject(BookingService);
    const check = service.canCancel(makeBooking({ eventDate: isoInDays(3), eventTime: '11:00 AM' }));
    expect(check.allowed).toBe(true);
    expect(check.reason).toBeNull();
  });

  it('blocks cancelling an unpaid booking within 2 hours of the start time', () => {
    const service = TestBed.inject(BookingService);
    const check = service.canCancel(makeBooking(soon(1)));
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Cancellation closed');
  });

  it('locks bookings that already have a payment (partial or paid)', () => {
    const service = TestBed.inject(BookingService);
    const partial = service.canCancel(
      makeBooking({ paymentStatus: 'partial', amountPaid: 26_180 })
    );
    const paid = service.canCancel(makeBooking({ paymentStatus: 'paid', amountPaid: 52_360 }));

    expect(partial.allowed).toBe(false);
    expect(partial.reason).toContain('Locked');
    expect(paid.allowed).toBe(false);
    expect(paid.reason).toContain('Locked');
  });

  it('blocks cancelling terminal bookings', () => {
    const service = TestBed.inject(BookingService);
    expect(service.canCancel(makeBooking({ status: 'cancelled' })).allowed).toBe(false);
    expect(service.canCancel(makeBooking({ status: 'completed' })).allowed).toBe(false);
  });

  it('rejects creation when the venue or address is missing', async () => {
    const service = TestBed.inject(BookingService);

    await expectAsyncError(
      firstValueFrom(service.create(makeDraft({ venue: '  ' }), { subtotal: 1, serviceCharge: 0, tax: 0, total: 1 })),
      'venue'
    );
    await expectAsyncError(
      firstValueFrom(service.create(makeDraft({ address: '' }), { subtotal: 1, serviceCharge: 0, tax: 0, total: 1 })),
      'address'
    );
  });

  it('rejects creation when the event date is less than 7 days ahead', async () => {
    const service = TestBed.inject(BookingService);
    await expectAsyncError(
      firstValueFrom(service.create(makeDraft({ eventDate: isoInDays(2) }), { subtotal: 1, serviceCharge: 0, tax: 0, total: 1 })),
      '7 days'
    );
  });

  it('rejects a date that already holds an active booking', async () => {
    const service = TestBed.inject(BookingService);
    // Pick a taken date that is still inside the bookable window (>= 7 days out).
    const taken = (await firstValueFrom(service.getTakenDates())).filter((d) => d >= minBookingDate());
    expect(taken.length).toBeGreaterThan(0);
    const target = taken[taken.length - 1];

    await expectAsyncError(
      firstValueFrom(service.create(makeDraft({ eventDate: target }), { subtotal: 1, serviceCharge: 0, tax: 0, total: 1 })),
      'fully booked'
    );
  });

  it('marks a newly booked date as taken and frees it once cancelled', async () => {
    const service = TestBed.inject(BookingService);
    const totals = { subtotal: 1, serviceCharge: 0, tax: 0, total: 1 };

    // Find a free bookable date (8+ days out, skipping any taken ones).
    let day = 8;
    let taken = await firstValueFrom(service.getTakenDates());
    while (taken.includes(isoInDays(day))) day += 1;
    const freeDate = isoInDays(day);

    const booking = await firstValueFrom(service.create(makeDraft({ eventDate: freeDate }), totals));
    taken = await firstValueFrom(service.getTakenDates());
    expect(taken).toContain(freeDate);

    await firstValueFrom(service.cancel(booking.id));
    expect(await firstValueFrom(service.getTakenDates())).not.toContain(freeDate);
  });

  it('creates a pending unpaid booking with zero amountPaid when details are complete', async () => {
    const service = TestBed.inject(BookingService);
    const booking = await firstValueFrom(service.create(makeDraft(), { subtotal: 42_500, serviceCharge: 4_250, tax: 5_610, total: 52_360 }));

    expect(booking.status).toBe('pending');
    expect(booking.paymentStatus).toBe('unpaid');
    expect(booking.amountPaid).toBe(0);
    expect(booking.bookingNumber).toMatch(/^ECB-\d{8}$/);
  });

  it('moves paymentStatus from partial to paid as payments accumulate', async () => {
    const service = TestBed.inject(BookingService);
    // Payments always target a booking the service created (the real app flow).
    const booking = await firstValueFrom(
      service.create(makeDraft(), { subtotal: 42_500, serviceCharge: 4_250, tax: 5_610, total: 52_360 })
    );

    service.applyPayment(booking.id, 26_180);
    expect(booking.paymentStatus).toBe('partial');
    expect(booking.amountPaid).toBe(26_180);

    service.applyPayment(booking.id, 26_180);
    expect(booking.paymentStatus).toBe('paid');
    expect(booking.amountPaid).toBe(52_360);
  });

  it('ignores extra payments on a fully paid booking', async () => {
    const service = TestBed.inject(BookingService);
    const booking = await firstValueFrom(
      service.create(makeDraft(), { subtotal: 42_500, serviceCharge: 4_250, tax: 5_610, total: 52_360 })
    );
    service.applyPayment(booking.id, 52_360);
    expect(booking.paymentStatus).toBe('paid');

    service.applyPayment(booking.id, 5_000);
    expect(booking.amountPaid).toBe(52_360);
  });

  it('returns upcoming bookings soonest-first', async () => {
    const service = TestBed.inject(BookingService);
    const list = await firstValueFrom(service.getUpcoming());
    const dates = list.map((b) => b.eventDate.slice(0, 10));
    expect(dates).toEqual([...dates].sort());
  });

  it('parses 12-hour slot strings into local event start dates', () => {
    const start = eventStart({ eventDate: '2026-11-10', eventTime: '4:00 PM' });
    expect(start.getHours()).toBe(16);
    expect(start.getMinutes()).toBe(0);
  });
});

async function expectAsyncError(promise: Promise<unknown>, fragment: string): Promise<void> {
  await promise.then(
    () => {
      throw new Error(`Expected promise to reject with "${fragment}"`);
    },
    (err: Error) => {
      expect(err.message).toContain(fragment);
    }
  );
}
