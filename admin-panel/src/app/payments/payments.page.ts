import { Component, OnInit, signal } from '@angular/core';

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

  constructor(private data: AdminDataService) {}

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
    this.data.updatePaymentStatus(payment.id, 'paid');
    this.load();
  }

  refund(payment: AdminPayment): void {
    this.data.updatePaymentStatus(payment.id, 'refunded');
    this.load();
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
    this.data.getPayments(this.activeStatus()).subscribe((list) => this.payments.set(list));
  }
}
