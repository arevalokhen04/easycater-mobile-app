import { Component, OnInit, signal } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

import { AdminDataService } from '../core/services/admin-data.service';
import { AdminPayment } from '../core/models/admin.models';

@Component({
  selector: 'app-payments-admin',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  standalone: false,
})
export class PaymentsAdminPage implements OnInit {
  readonly statuses = ['all', 'pending', 'paid', 'failed', 'refunded'];

  readonly payments = signal<AdminPayment[]>([]);
  readonly activeStatus = signal('all');
  readonly loading = signal(true);
  readonly busy = signal(false);

  constructor(
    private data: AdminDataService,
    private alert: AlertController,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    this.load();
  }

  money(value: number): string {
    return `PHP ${Math.abs(value).toLocaleString('en-PH')}`;
  }

  setStatus(status: string): void {
    this.activeStatus.set(status);
    this.load();
  }

  verify(payment: AdminPayment): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.data.updatePaymentStatus(payment.id, 'paid').subscribe({
      next: () => {
        this.busy.set(false);
        this.load();
        this.notify(`${payment.referenceNumber} verified`);
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.notify(err.message);
      },
    });
  }

  /** Refund moves real money - always confirm first (error prevention). */
  async refund(payment: AdminPayment): Promise<void> {
    const alert = await this.alert.create({
      header: 'Refund this payment?',
      message: `${payment.referenceNumber} — ${this.money(payment.amount)} (${
        payment.customerName ?? 'customer'
      }) will be marked as refunded.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Refund',
          role: 'destructive',
          handler: () => {
            if (this.busy()) return;
            this.busy.set(true);
            this.data.updatePaymentStatus(payment.id, 'refunded').subscribe({
              next: () => {
                this.busy.set(false);
                this.load();
                this.notify(`${payment.referenceNumber} refunded`);
              },
              error: (err: Error) => {
                this.busy.set(false);
                this.notify(err.message);
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  statusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'ok';
      case 'pending':
        return 'wait';
      case 'refunded':
        return 'info';
      case 'failed':
        return 'hot';
      default:
        return 'grey';
    }
  }

  /** Friendly payment method names (H2 - speak the user's language). */
  methodLabel(method: string): string {
    const map: Record<string, string> = {
      gcash: 'GCash',
      maya: 'Maya',
      'credit-card': 'Credit Card',
      'bank-transfer': 'Bank Transfer',
      cash: 'Cash',
    };
    return map[method] ?? method;
  }

  methodIcon(method: string): string {
    switch (method) {
      case 'gcash':
        return 'wallet-outline';
      case 'maya':
        return 'phone-portrait-outline';
      case 'credit-card':
        return 'card-outline';
      case 'bank-transfer':
        return 'business-outline';
      default:
        return 'cash-outline';
    }
  }

  get totalPaid(): number {
    return this.payments()
      .filter((p) => p.status === 'paid')
      .reduce((s, p) => s + p.amount, 0);
  }

  get totalRefunded(): number {
    return Math.abs(
      this.payments()
        .filter((p) => p.status === 'refunded')
        .reduce((s, p) => s + p.amount, 0)
    );
  }

  private load(): void {
    this.loading.set(true);
    this.data.getPayments(this.activeStatus()).subscribe({
      next: (list) => {
        this.payments.set(list);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.notify(err.message);
      },
    });
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2200, position: 'bottom' });
    await t.present();
  }
}
