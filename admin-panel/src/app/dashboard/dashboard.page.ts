import { Component, OnInit, signal } from '@angular/core';

import { AdminDataService } from '../core/services/admin-data.service';
import { AuthService } from '../core/services/auth.service';
import { DashboardSummary } from '../core/models/admin.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  // Signals: this app runs zoneless, so plain fields set inside subscribe()
  // would never reach the view.
  readonly summary = signal<DashboardSummary | undefined>(undefined);
  readonly loading = signal(true);
  readonly maxBar = signal(1);

  constructor(
    private data: AdminDataService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.data.getSummary().subscribe((summary) => {
      this.summary.set(summary);
      this.maxBar.set(Math.max(...summary.revenueTrend.map((t) => t.revenue), 1));
      this.loading.set(false);
    });
  }

  /** Packages ranked by how often they get booked - most booked first. */
  topPackages(): { name: string; bookings: number }[] {
    return this.summary()?.topPackages ?? [];
  }

  maxBookings(): number {
    const list = this.topPackages();
    return Math.max(...list.map((p) => p.bookings), 1);
  }

  bookingsBarWidth(bookings: number): number {
    return Math.round((bookings / this.maxBookings()) * 100);
  }

  topPackageName(): string {
    const list = this.topPackages();
    return list.length ? `${list[0].name} (${list[0].bookings} bookings)` : '';
  }

  get adminName(): string {
    return this.auth.user()?.name ?? 'Administrator';
  }

  money(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  barHeight(revenue: number): number {
    return Math.round((revenue / this.maxBar()) * 100);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'ok';
      case 'cancelled':
        return 'hot';
      case 'pending':
        return 'wait';
      case 'confirmed':
        return 'info';
      default:
        return 'soon';
    }
  }
}
