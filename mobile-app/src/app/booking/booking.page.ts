import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { BookingService } from '../core/services/booking.service';
import { CartService, minBookingDate } from '../core/services/cart.service';
import {
  GENERAL_TINIO_BARANGAYS,
  VenueSuggestion,
  VENUE_SUGGESTIONS,
  barangayAddress,
  barangayFromAddress,
} from '../core/data/locations';

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {
  readonly eventTypes = [
    { key: 'wedding', label: 'Wedding' },
    { key: 'corporate', label: 'Corporate' },
    { key: 'birthday', label: 'Birthday' },
    { key: 'christening', label: 'Christening' },
    { key: 'graduation', label: 'Graduation' },
    { key: 'other', label: 'Other' },
  ];

  readonly timeSlots = ['7:00 AM', '11:00 AM', '1:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];

  readonly eventType = signal('other');
  readonly eventDate = signal('');
  readonly eventTime = signal('11:00 AM');
  readonly venue = signal('');
  readonly address = signal('');
  readonly notes = signal('');
  readonly selectedBarangay = signal('');

  /** Upcoming dates that already hold a booking - shown as fully booked. */
  readonly takenDates = signal<string[]>([]);

  /** Address is limited to the service area: barangays of General Tinio only. */
  readonly barangays = GENERAL_TINIO_BARANGAYS;
  readonly venueSuggestions = VENUE_SUGGESTIONS;

  /** One-tap venue suggestions, narrowed as the user types. */
  readonly filteredVenues = computed<VenueSuggestion[]>(() => {
    const query = this.venue().trim().toLowerCase();
    const list = query
      ? this.venueSuggestions.filter((v) => v.name.toLowerCase().includes(query))
      : this.venueSuggestions;
    return list.filter((v) => v.name !== this.venue().trim());
  });

  readonly selectedDateTaken = computed(() => {
    const date = this.eventDate();
    return !!date && this.takenDates().includes(date);
  });

  /** Green confirmation under the calendar when the chosen date is open. */
  readonly selectedDateAvailable = computed(() => {
    const date = this.eventDate();
    return (
      !!date &&
      date >= minBookingDate() &&
      !this.takenDates().includes(date)
    );
  });

  readonly selectedDateLabel = computed(() => {
    const date = this.eventDate();
    if (!date) return '';
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  });

  /**
   * Live checklist driven by THIS page's fields (not the cart draft, which
   * only updates on review) - otherwise the CTA would never unlock.
   */
  readonly checklist = computed<{ key: string; label: string; done: boolean }[]>(() => [
    {
      key: 'date',
      label: 'Event date (7+ days ahead, still free)',
      done:
        !!this.eventDate() &&
        this.eventDate() >= minBookingDate() &&
        !this.takenDates().includes(this.eventDate()),
    },
    { key: 'venue', label: 'Venue name', done: this.venue().trim().length > 0 },
    { key: 'address', label: 'Venue address', done: this.address().trim().length > 0 },
  ]);

  readonly canProceed = computed(() => this.checklist().every((c) => c.done));

  constructor(
    public cart: CartService,
    private bookingService: BookingService,
    private router: Router,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    const draft = this.cart.state();

    // Landing here with no package selected is a dead end - send them back.
    if (!draft.package) {
      this.router.navigateByUrl('/tabs/packages', { replaceUrl: true });
      return;
    }

    this.syncFromDraft();
  }

  /** Pages are cached by the Ionic route strategy - refresh on every entry. */
  ionViewWillEnter(): void {
    if (this.cart.state().package) {
      this.syncFromDraft();
    }
  }

  private syncFromDraft(): void {
    const draft = this.cart.state();
    this.eventType.set(draft.eventType);
    this.eventDate.set(draft.eventDate ? draft.eventDate.slice(0, 10) : '');
    this.eventTime.set(draft.eventTime);
    this.venue.set(draft.venue);
    this.address.set(draft.address);
    this.selectedBarangay.set(barangayFromAddress(draft.address));
    this.notes.set(draft.notes);
    this.loadTakenDates();
  }

  private loadTakenDates(): void {
    this.bookingService.getTakenDates().subscribe((dates) => this.takenDates.set(dates));
  }

  /** Error prevention: the calendar only offers valid dates (today + 7 days). */
  get minDate(): string {
    return minBookingDate();
  }

  /**
   * Calendar rule: a date is selectable only inside the 7-day window and not
   * yet booked (one event per day). Read fresh on every call by the calendar.
   */
  readonly isDateEnabled = (dateIsoString: string): boolean => {
    const date = String(dateIsoString).slice(0, 10);
    return date >= minBookingDate() && !this.takenDates().includes(date);
  };

  /**
   * ion-datetime does not watch isDateEnabled, so the calendar element is
   * re-created whenever the taken dates (or the window) change.
   */
  readonly calendarKey = computed(
    () => `${this.takenDates().join(',')}|${minBookingDate()}`
  );

  setEventType(key: string): void {
    this.eventType.set(key);
  }

  setEventTime(slot: string): void {
    this.eventTime.set(slot);
  }

  applyVenueSuggestion(suggestion: VenueSuggestion): void {
    this.venue.set(suggestion.name);
  }

  /** Calendar change - normalize to YYYY-MM-DD. */
  onDateChange(value: string | null | undefined): void {
    this.eventDate.set(value ? String(value).slice(0, 10) : '');
  }

  /** The dropdown only offers General Tinio barangays - store the full address. */
  onAddressChange(barangay: string): void {
    this.selectedBarangay.set(barangay);
    this.address.set(barangay ? barangayAddress(barangay) : '');
  }

  changeGuests(delta: number): void {
    const pkg = this.cart.state().package;
    if (!pkg) return;
    this.cart.setGuestCount(this.cart.state().guestCount + delta);
  }

  reviewOrder(): void {
    if (!this.canProceed()) {
      // Belt and braces - the button is disabled, but the service validates too.
      this.notify('Complete the highlighted details to continue');
      return;
    }

    this.cart.updateDetails({
      eventType: this.eventType(),
      eventDate: this.eventDate(),
      eventTime: this.eventTime(),
      venue: this.venue().trim(),
      address: this.address().trim(),
      notes: this.notes().trim(),
    });

    // Next step in the flow: add extras from the menu, then review the cart.
    this.router.navigateByUrl('/tabs/menu');
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, position: 'bottom' });
    await t.present();
  }
}
