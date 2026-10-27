import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { CateringPackage } from '../models/package.model';
import { MenuItem } from '../models/menu-item.model';
import { BookingAddOn } from '../models/booking.model';
import { OrderTotals } from '../models/notification.model';

const SERVICE_RATE = 0.1;
const TAX_RATE = 0.12;

export interface BookingDraft {
  packageId: string | null;
  package: CateringPackage | null;
  guestCount: number;
  addOns: BookingAddOn[];
  eventType: string;
  eventDate: string | null;
  eventTime: string;
  venue: string;
  address: string;
  notes: string;
}

/**
 * Holds the in-progress order (selected package + add-ons + event details)
 * between the Package Details, Booking and Payment screens.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly draft = signal<BookingDraft>({
    packageId: null,
    package: null,
    guestCount: 0,
    addOns: [],
    eventType: 'other',
    eventDate: null,
    eventTime: '11:00 AM',
    venue: '',
    address: '',
    notes: '',
  });

  readonly state = this.draft.asReadonly();
  readonly addOnCount = computed(() => this.draft().addOns.length);
  readonly hasItems = computed(() => this.draft().package !== null);
  readonly totals = computed<OrderTotals>(() => this.computeTotals(this.draft()));

  selectPackage(pkg: CateringPackage, guestCount?: number): void {
    const guest = guestCount ?? Math.max(pkg.minGuests, 20);
    this.draft.update((d) => ({
      ...d,
      packageId: pkg.id,
      package: pkg,
      guestCount: guest,
      eventType: pkg.category,
      addOns: [],
    }));
  }

  setGuestCount(count: number): void {
    const pkg = this.draft().package;
    if (!pkg) return;
    const clamped = Math.min(Math.max(count, pkg.minGuests), pkg.maxGuests);
    this.draft.update((d) => ({ ...d, guestCount: clamped }));
  }

  addItem(item: MenuItem): void {
    this.draft.update((d) => {
      const existing = d.addOns.find((a) => a.menuItemId === item.id);
      const addOns = existing
        ? d.addOns.map((a) => (a.menuItemId === item.id ? { ...a, quantity: a.quantity + 1 } : a))
        : [...d.addOns, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
      return { ...d, addOns };
    });
  }

  removeItem(menuItemId: string): void {
    this.draft.update((d) => ({
      ...d,
      addOns: d.addOns
        .map((a) =>
          a.menuItemId === menuItemId ? { ...a, quantity: a.quantity - 1 } : a
        )
        .filter((a) => a.quantity > 0),
    }));
  }

  updateDetails(changes: Partial<BookingDraft>): void {
    this.draft.update((d) => ({ ...d, ...changes }));
  }

  clear(): void {
    this.draft.set({
      packageId: null,
      package: null,
      guestCount: 0,
      addOns: [],
      eventType: 'other',
      eventDate: null,
      eventTime: '11:00 AM',
      venue: '',
      address: '',
      notes: '',
    });
  }

  /** Guards the Booking/Payment screens so they cannot render without a package. */
  requirePackage(): Observable<CateringPackage> {
    const pkg = this.draft().package;
    if (!pkg) return throwError(() => new Error('Select a package first'));
    return of(pkg);
  }

  /** Fake submit used by the payment screen; the booking service replaces this. */
  submit(): Observable<{ bookingNumber: string }> {
    return of({ bookingNumber: `ECB-${Date.now().toString().slice(-8)}` }).pipe(
      delay(600),
      tap(() => undefined)
    );
  }

  private computeTotals(d: BookingDraft): OrderTotals {
    if (!d.package) return { subtotal: 0, serviceCharge: 0, tax: 0, total: 0 };

    const addOnsTotal = d.addOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
    const subtotal = d.package.pricePerHead * d.guestCount + addOnsTotal;
    const serviceCharge = Math.round(subtotal * SERVICE_RATE);
    const tax = Math.round((subtotal + serviceCharge) * TAX_RATE);

    return { subtotal, serviceCharge, tax, total: subtotal + serviceCharge + tax };
  }
}
