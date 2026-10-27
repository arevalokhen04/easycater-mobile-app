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
