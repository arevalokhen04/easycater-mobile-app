import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import {
  AdminBooking,
  AdminMenuItem,
  AdminPackage,
  AdminPayment,
  AdminUser,
  DashboardSummary,
  SalesReport,
  TopCustomer,
} from '../models/admin.models';
import {
  MOCK_ADMIN_BOOKINGS,
  MOCK_ADMIN_MENU,
  MOCK_ADMIN_PAYMENTS,
  MOCK_CUSTOMERS,
  MOCK_PACKAGES,
} from '../data/mock-admin-data';

/**
 * In-memory store backing every admin screen. Each method mirrors the shape of
 * the matching backend endpoint so the UI does not change when you swap the
 * bodies for `ApiService` calls.
 */
@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private packages = [...MOCK_PACKAGES];
  private menu = [...MOCK_ADMIN_MENU];
  private bookings = [...MOCK_ADMIN_BOOKINGS];
  private payments = [...MOCK_ADMIN_PAYMENTS];
  private customers = [...MOCK_CUSTOMERS];

  /* ------------------------------------------------------------ Dashboard */

  getSummary(): Observable<DashboardSummary> {
    const today = new Date().toISOString().slice(0, 10);
    const paid = this.payments.filter((p) => p.status === 'paid');

    const revenueTrend = this.buildTrend(6, paid);

    const summary: DashboardSummary = {
      totalRevenue: paid.reduce((sum, p) => sum + p.amount, 0),
      totalBookings: this.bookings.length,
      pendingBookings: this.bookings.filter((b) => b.status === 'pending').length,
      upcomingBookings: this.bookings.filter(
        (b) => b.eventDate.slice(0, 10) >= today && b.status !== 'cancelled'
      ).length,
      totalCustomers: this.customers.length,
      activePackages: this.packages.filter((p) => p.isActive).length,
      activeMenuItems: this.menu.filter((m) => m.isAvailable).length,
      revenueTrend,
      recentBookings: [...this.bookings].sort((a, b) => b.eventDate.localeCompare(a.eventDate)).slice(0, 5),
    };

    return of(summary).pipe(delay(300));
  }

  /* ------------------------------------------------------------ Packages */

  getPackages(search = ''): Observable<AdminPackage[]> {
    let list = this.packages;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return of([...list]).pipe(delay(200));
  }

  savePackage(pkg: Partial<AdminPackage>): Observable<AdminPackage> {
    if (pkg.id) {
      const idx = this.packages.findIndex((p) => p.id === pkg.id);
      if (idx === -1) return of(pkg as AdminPackage);
      this.packages[idx] = { ...this.packages[idx], ...pkg };
      return of(this.packages[idx]).pipe(delay(250));
    }

    const created: AdminPackage = {
      id: `p-${Date.now()}`,
      name: pkg.name ?? 'New package',
      category: pkg.category ?? 'other',
      pricePerHead: pkg.pricePerHead ?? 0,
      minGuests: pkg.minGuests ?? 10,
      maxGuests: pkg.maxGuests ?? 200,
      image: pkg.image ?? '',
      isActive: pkg.isActive ?? true,
      isPopular: pkg.isPopular ?? false,
      bookedCount: 0,
    };
    this.packages = [created, ...this.packages];
    return of(created).pipe(delay(250));
  }

  togglePackageActive(id: string): void {
    this.packages = this.packages.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
  }

  deletePackage(id: string): void {
    this.packages = this.packages.filter((p) => p.id !== id);
  }

  /* ---------------------------------------------------------------- Menu */

  getMenu(search = '', category = 'all'): Observable<AdminMenuItem[]> {
    let list = this.menu;
    if (category !== 'all') list = list.filter((m) => m.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    return of([...list]).pipe(delay(200));
  }

  saveMenuItem(item: Partial<AdminMenuItem>): Observable<AdminMenuItem> {
    if (item.id) {
      const idx = this.menu.findIndex((m) => m.id === item.id);
      if (idx === -1) return of(item as AdminMenuItem);
      this.menu[idx] = { ...this.menu[idx], ...item };
      return of(this.menu[idx]).pipe(delay(250));
    }

    const created: AdminMenuItem = {
      id: `m-${Date.now()}`,
      name: item.name ?? 'New dish',
      category: item.category ?? 'main-course',
      price: item.price ?? 0,
      image: item.image ?? '',
      isAvailable: item.isAvailable ?? true,
      isFeatured: item.isFeatured ?? false,
    };
    this.menu = [created, ...this.menu];
    return of(created).pipe(delay(250));
  }

  toggleMenuItem(id: string): void {
    this.menu = this.menu.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m));
  }

  deleteMenuItem(id: string): void {
    this.menu = this.menu.filter((m) => m.id !== id);
  }

  /* ------------------------------------------------------------ Bookings */

  getBookings(status = 'all'): Observable<AdminBooking[]> {
    const list =
      status === 'all' ? this.bookings : this.bookings.filter((b) => b.status === status);
    return of([...list].sort((a, b) => b.eventDate.localeCompare(a.eventDate))).pipe(delay(200));
  }

  updateBookingStatus(id: string, status: string): void {
    this.bookings = this.bookings.map((b) => (b.id === id ? { ...b, status } : b));
  }

  /* ------------------------------------------------------------ Payments */

  getPayments(status = 'all'): Observable<AdminPayment[]> {
    const list = status === 'all' ? this.payments : this.payments.filter((p) => p.status === status);
    return of([...list].sort((a, b) => b.paidAt.localeCompare(a.paidAt))).pipe(delay(200));
  }

  updatePaymentStatus(id: string, status: string): void {
    this.payments = this.payments.map((p) => (p.id === id ? { ...p, status } : p));
  }

  /* ----------------------------------------------------------- Customers */

  getCustomers(search = ''): Observable<AdminUser[]> {
    let list = this.customers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }
    return of([...list]).pipe(delay(200));
  }

  toggleCustomerActive(id: string): void {
    this.customers = this.customers.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
  }

  deleteCustomer(id: string): void {
    this.customers = this.customers.filter((c) => c.id !== id);
  }

  /* ------------------------------------------------------------- Reports */

  getSalesReport(): Observable<SalesReport> {
    const paid = this.payments.filter((p) => p.status === 'paid');

    const byMethod = paid.reduce<Record<string, number>>((acc, p) => {
      acc[p.method] = (acc[p.method] ?? 0) + 1;
      return acc;
    }, {});

    const byPackage = this.packages
      .map((p) => {
        const rows = this.bookings.filter((b) => b.packageName === p.name && b.status !== 'cancelled');
        return {
          name: p.name,
          category: p.category,
          bookings: rows.length,
          revenue: rows.reduce((sum, b) => sum + b.total, 0),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const report: SalesReport = {
      revenue: paid.reduce((sum, p) => sum + p.amount, 0),
      payments: paid.length,
      byMethod,
      byPackage,
    };

    return of(report).pipe(delay(300));
  }

  getTopCustomers(limit = 5): Observable<TopCustomer[]> {
    const rows = this.customers
      .map((c) => ({ name: c.name, email: c.email, bookings: c.bookings, spend: c.totalSpent }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, limit);
    return of(rows).pipe(delay(250));
  }

  getMonthlyBookings(): Observable<{ label: string; bookings: number; revenue: number }[]> {
    return of(this.buildTrend(6, this.payments)).pipe(delay(250));
  }

  /* -------------------------------------------------------------- Helpers */

  private buildTrend(
    months: number,
    payments: AdminPayment[]
  ): { label: string; revenue: number; bookings: number }[] {
    const buckets: { label: string; revenue: number; bookings: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        revenue: 0,
        bookings: 0,
      });
    }

    payments.forEach((p) => {
      if (p.status !== 'paid') return;
      const paidAt = new Date(p.paidAt);
      // Months between the payment and now: 0 = this month, -1 = last month.
      const offset =
        (paidAt.getFullYear() - now.getFullYear()) * 12 + (paidAt.getMonth() - now.getMonth());
      // Buckets run oldest (index 0) to newest (index months - 1), so a payment
      // from `offset` months ago belongs at `months - 1 + offset`. Future-dated
      // payments fall outside the range and are skipped by the bounds check.
      const index = months - 1 + offset;
      if (index >= 0 && index < months) {
        buckets[index].revenue += p.amount;
        buckets[index].bookings += 1;
      }
    });

    return buckets;
  }
}
