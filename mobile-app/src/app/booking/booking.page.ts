import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { CartService } from '../core/services/cart.service';

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

  constructor(
    public cart: CartService,
    private router: Router,
    private alert: AlertController,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    const draft = this.cart.state();

    // Landing here with no package selected is a dead end - send them back.
    if (!draft.package) {
      this.router.navigateByUrl('/tabs/packages', { replaceUrl: true });
      return;
    }

    this.eventType.set(draft.eventType);
    this.eventDate.set(draft.eventDate ? draft.eventDate.slice(0, 10) : '');
    this.eventTime.set(draft.eventTime);
    this.venue.set(draft.venue);
    this.address.set(draft.address);
    this.notes.set(draft.notes);
  }

  get minDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  setEventType(key: string): void {
    this.eventType.set(key);
  }

  setEventTime(slot: string): void {
    this.eventTime.set(slot);
  }

  changeGuests(delta: number): void {
    const pkg = this.cart.state().package;
    if (!pkg) return;
    this.cart.setGuestCount(this.cart.state().guestCount + delta);
  }

  reviewOrder(): void {
    if (!this.eventDate()) {
      this.notify('Choose an event date to continue');
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

    this.router.navigateByUrl('/cart');
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, position: 'bottom' });
    await t.present();
  }
}





