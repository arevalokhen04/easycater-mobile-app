import { Component, OnInit, signal } from '@angular/core';

import { AdminDataService } from '../core/services/admin-data.service';
import { SalesReport, TopCustomer } from '../core/models/admin.models';

@Component({
  selector: 'app-reports-admin',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: false,
})
export class ReportsAdminPage implements OnInit {
  readonly report = signal<SalesReport | undefined>(undefined);
  readonly topCustomers = signal<TopCustomer[]>([]);
  readonly trend = signal<{ label: string; bookings: number; revenue: number }[]>([]);
  readonly maxRevenue = signal(1);
  readonly loading = signal(true);

  constructor(private data: AdminDataService) {}

  ngOnInit(): void {
    this.data.getSalesReport().subscribe((report) => {
      this.report.set(report);
      this.loading.set(false);
    });
    this.data.getTopCustomers(5).subscribe((rows) => this.topCustomers.set(rows));
    this.data.getMonthlyBookings().subscribe((rows) => {
      this.trend.set(rows);
      this.maxRevenue.set(Math.max(...rows.map((r) => r.revenue), 1));
    });
  }

  money(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  barHeight(revenue: number): number {
    return Math.round((revenue / this.maxRevenue()) * 100);
  }

  methodEntries(): { method: string; count: number }[] {
    const report = this.report();
    if (!report) return [];
    return Object.entries(report.byMethod).map(([method, count]) => ({ method, count }));
  }

  maxMethodCount(): number {
    const entries = this.methodEntries();
    return Math.max(...entries.map((e) => e.count), 1);
  }
}
