import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
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

/* -------------------------------------------------------------- mappers */

// Backend rows are raw Mongo documents; the mapping glue reads them loosely.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = any;

const rowId = (raw: Row): string => (raw._id ?? raw.id) as string;

function mapAdminPackage(raw: Row): AdminPackage {
  return {
    ...(raw as unknown as AdminPackage),
    id: rowId(raw),
    bookedCount: (raw.bookedCount as number) ?? 0,
  };
}

function mapAdminMenuItem(raw: Row): AdminMenuItem {
  return { ...(raw as unknown as AdminMenuItem), id: rowId(raw) };
}

function mapAdminBooking(raw: Row): AdminBooking {
  const customer = raw.customer as { name?: string; email?: string } | string | undefined;
  const pkg = raw.package as { name?: string } | string | undefined;
  return {
    ...(raw as unknown as AdminBooking),
    id: rowId(raw),
    customerName:
      typeof customer === 'object'
        ? (customer?.name ?? 'Deleted account')
        : ((raw.customerName as string) ?? 'Deleted account'),
    customerEmail:
      typeof customer === 'object' ? (customer?.email ?? '') : ((raw.customerEmail as string) ?? ''),
    packageName: typeof pkg === 'object' ? (pkg?.name ?? '—') : ((raw.packageName as string) ?? '—'),
    eventDate: String(raw.eventDate ?? '').slice(0, 10),
  };
}

function mapAdminPayment(raw: Row): AdminPayment {
  const booking = raw.booking as { bookingNumber?: string } | string | undefined;
  const user = raw.user as { name?: string } | string | undefined;
  return {
    ...(raw as unknown as AdminPayment),
    id: rowId(raw),
    bookingNumber:
      typeof booking === 'object' ? (booking?.bookingNumber ?? '—') : ((raw.bookingNumber as string) ?? '—'),
    customerName:
      typeof user === 'object'
        ? (user?.name ?? 'Deleted account')
        : ((raw.customerName as string) ?? 'Deleted account'),
    paidAt: (raw.paidAt as string) ?? '',
  };
}

function mapAdminUser(raw: Row): AdminUser {
  return {
    ...(raw as unknown as AdminUser),
    id: rowId(raw),
    joinedAt: (raw.createdAt as string) ?? (raw.joinedAt as string) ?? '',
    bookings: (raw.bookings as number) ?? 0,
    totalSpent: (raw.totalSpent as number) ?? 0,
  };
}

const monthLabel = (year: number, month1to12: number): string =>
  new Date(year, month1to12 - 1, 1).toLocaleString('en-US', { month: 'short', year: '2-digit' });

/**
 * Data backing every admin screen. Mock mode (environment.useMockData) serves
 * in-memory fixtures; otherwise every call goes to the backend API.
 */
@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private packages = [...MOCK_PACKAGES];
  private menu = [...MOCK_ADMIN_MENU];
  private bookings = [...MOCK_ADMIN_BOOKINGS];
  private payments = [...MOCK_ADMIN_PAYMENTS];
  private customers = [...MOCK_CUSTOMERS];

  private api = inject(ApiService);

  /* ------------------------------------------------------------ Dashboard */

  getSummary(): Observable<DashboardSummary> {
    if (environment.useMockData) {
      const today = new Date().toISOString().slice(0, 10);
      const paid = this.payments.filter((p) => p.status === 'paid');

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
        revenueTrend: this.buildTrend(6, paid),
        recentBookings: [...this.bookings].sort((a, b) => b.eventDate.localeCompare(a.eventDate)).slice(0, 5),
      };

      return of(summary).pipe(delay(300));
    }

    return this.api.get<Row>('/dashboard').pipe(
      switchMap((d) =>
        this.api
          .get<{ label: string; revenue: number; count: number }[]>('/dashboard/chart', { months: 6 })
          .pipe(
            map((chart) => {
              const recent = (d.recentBookings ?? []) as Row[];
              return {
                totalRevenue: (d.totalRevenue as number) ?? 0,
                totalBookings: (d.totalBookings as number) ?? 0,
                pendingBookings: (d.pendingBookings as number) ?? 0,
                upcomingBookings: (d.upcomingBookings as number) ?? 0,
                totalCustomers: (d.totalCustomers as number) ?? 0,
                activePackages: (d.totalPackages as number) ?? 0,
                activeMenuItems: (d.activeMenuItems as number) ?? 0,
                revenueTrend: chart.map((c) => ({ label: c.label, revenue: c.revenue, bookings: c.count })),
                recentBookings: recent.map(mapAdminBooking),
              } satisfies DashboardSummary;
            })
          )
      )
    );
  }

  /* ------------------------------------------------------------ Packages */

  getPackages(search = ''): Observable<AdminPackage[]> {
    if (environment.useMockData) {
      let list = this.packages;
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q));
      }
      return of([...list]).pipe(delay(200));
    }

    const params: Record<string, unknown> = { limit: 100 };
    if (search) params["search"] = search;
    return this.api
      .get<Row[]>('/packages', params)
      .pipe(map((rows) => rows.map(mapAdminPackage)));
  }

  savePackage(pkg: Partial<AdminPackage>): Observable<AdminPackage> {
    if (environment.useMockData) {
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
        pricePerHead: Number(pkg.pricePerHead ?? 0),
        minGuests: Number(pkg.minGuests ?? 10),
        maxGuests: Number(pkg.maxGuests ?? 200),
        image: pkg.image ?? '',
        isActive: pkg.isActive ?? true,
        isPopular: pkg.isPopular ?? false,
        bookedCount: 0,
      };
      this.packages = [created, ...this.packages];
      return of(created).pipe(delay(250));
    }

    if (pkg.id) {
      return this.api
        .put<Row>(`/packages/${pkg.id}`, pkg)
        .pipe(map(mapAdminPackage));
    }
    return this.api
      .post<Row>('/packages', pkg)
      .pipe(map(mapAdminPackage));
  }

  togglePackageActive(id: string): Observable<void> {
    if (environment.useMockData) {
      this.packages = this.packages.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
      return of(undefined);
    }

    // Fetch the current state, then flip it.
    return this.api.get<Row>(`/packages/${id}`).pipe(
      switchMap((p) => this.api.put<Row>(`/packages/${id}`, { isActive: !(p.isActive as boolean) })),
      map(() => undefined)
    );
  }

  deletePackage(id: string): Observable<void> {
    if (environment.useMockData) {
      this.packages = this.packages.filter((p) => p.id !== id);
      return of(undefined);
    }
    return this.api.delete<void>(`/packages/${id}`);
  }

  /* ---------------------------------------------------------------- Menu */

  getMenu(search = '', category = 'all'): Observable<AdminMenuItem[]> {
    if (environment.useMockData) {
      let list = this.menu;
      if (category !== 'all') list = list.filter((m) => m.category === category);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((m) => m.name.toLowerCase().includes(q));
      }
      return of([...list]).pipe(delay(200));
    }

    const params: Record<string, unknown> = {};
    if (category !== 'all') params["category"] = category;
    if (search) params["search"] = search;
    return this.api
      .get<Row[]>('/menu', params)
      .pipe(map((rows) => rows.map(mapAdminMenuItem)));
  }

  saveMenuItem(item: Partial<AdminMenuItem>): Observable<AdminMenuItem> {
    if (environment.useMockData) {
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
        price: Number(item.price ?? 0),
        image: item.image ?? '',
        isAvailable: item.isAvailable ?? true,
        isFeatured: item.isFeatured ?? false,
      };
      this.menu = [created, ...this.menu];
      return of(created).pipe(delay(250));
    }

    if (item.id) {
      return this.api.put<Row>(`/menu/${item.id}`, item).pipe(map(mapAdminMenuItem));
    }
    return this.api.post<Row>('/menu', item).pipe(map(mapAdminMenuItem));
  }

  toggleMenuItem(id: string): Observable<void> {
    if (environment.useMockData) {
      this.menu = this.menu.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m));
      return of(undefined);
    }

    return this.api.get<Row>(`/menu/${id}`).pipe(
      switchMap((m) => this.api.put<Row>(`/menu/${id}`, { isAvailable: !(m.isAvailable as boolean) })),
      map(() => undefined)
    );
  }

  deleteMenuItem(id: string): Observable<void> {
    if (environment.useMockData) {
      this.menu = this.menu.filter((m) => m.id !== id);
      return of(undefined);
    }
    return this.api.delete<void>(`/menu/${id}`);
  }

  /* ------------------------------------------------------------ Bookings */

  getBookings(status = 'all'): Observable<AdminBooking[]> {
    if (environment.useMockData) {
      const list =
        status === 'all' ? this.bookings : this.bookings.filter((b) => b.status === status);
      return of([...list].sort((a, b) => b.eventDate.localeCompare(a.eventDate))).pipe(delay(200));
    }

    const params: Record<string, unknown> = { limit: 100 };
    if (status !== 'all') params["status"] = status;
    return this.api
      .get<Row[]>('/bookings', params)
      .pipe(map((rows) => rows.map(mapAdminBooking)));
  }

  updateBookingStatus(id: string, status: string): Observable<void> {
    if (environment.useMockData) {
      this.bookings = this.bookings.map((b) => (b.id === id ? { ...b, status } : b));
      return of(undefined);
    }
    return this.api.put<Row>(`/bookings/${id}/status`, { status }).pipe(map(() => undefined));
  }

  /* ------------------------------------------------------------ Payments */

  getPayments(status = 'all'): Observable<AdminPayment[]> {
    if (environment.useMockData) {
      const list = status === 'all' ? this.payments : this.payments.filter((p) => p.status === status);
      return of([...list].sort((a, b) => b.paidAt.localeCompare(a.paidAt))).pipe(delay(200));
    }

    const params: Record<string, unknown> = { limit: 100 };
    if (status !== 'all') params["status"] = status;
    return this.api
      .get<Row[]>('/payments', params)
      .pipe(map((rows) => rows.map(mapAdminPayment)));
  }

  updatePaymentStatus(id: string, status: string): Observable<void> {
    if (environment.useMockData) {
      this.payments = this.payments.map((p) => (p.id === id ? { ...p, status } : p));
      return of(undefined);
    }
    return this.api.put<Row>(`/payments/${id}`, { status }).pipe(map(() => undefined));
  }

  /* ----------------------------------------------------------- Customers */

  getCustomers(search = ''): Observable<AdminUser[]> {
    if (environment.useMockData) {
      let list = this.customers;
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        );
      }
      return of([...list]).pipe(delay(200));
    }

    const params: Record<string, unknown> = { limit: 100 };
    if (search) params["search"] = search;
    return this.api
      .get<Row[]>('/users', params)
      .pipe(map((rows) => rows.map(mapAdminUser)));
  }

  toggleCustomerActive(id: string): Observable<void> {
    if (environment.useMockData) {
      this.customers = this.customers.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
      return of(undefined);
    }

    return this.api.get<Row>(`/users/${id}`).pipe(
      switchMap((u) => this.api.put<Row>(`/users/${id}`, { isActive: !(u.isActive as boolean) })),
      map(() => undefined)
    );
  }

  deleteCustomer(id: string): Observable<void> {
    if (environment.useMockData) {
      this.customers = this.customers.filter((c) => c.id !== id);
      return of(undefined);
    }
    return this.api.delete<void>(`/users/${id}`);
  }

  /* ------------------------------------------------------------- Reports */

  getSalesReport(): Observable<SalesReport> {
    if (environment.useMockData) {
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

    return this.api
      .get<{ revenue: number; payments: number; byMethod: Record<string, number>; byPackage: SalesReport['byPackage'] }>(
        '/reports/sales'
      )
      .pipe(
        map((r) => ({
          revenue: r.revenue ?? 0,
          payments: r.payments ?? 0,
          byMethod: r.byMethod ?? {},
          byPackage: [...(r.byPackage ?? [])].sort((a, b) => b.revenue - a.revenue),
        }))
      );
  }

  getTopCustomers(limit = 5): Observable<TopCustomer[]> {
    if (environment.useMockData) {
      const rows = this.customers
        .map((c) => ({ name: c.name, email: c.email, bookings: c.bookings, spend: c.totalSpent }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, limit);
      return of(rows).pipe(delay(250));
    }

    return this.api
      .get<{ user: { name: string; email: string }; bookings: number; spend: number }[]>(
        '/reports/customers'
      )
      .pipe(
        map((rows) =>
          rows
            .map((r) => ({
              name: r.user?.name ?? '—',
              email: r.user?.email ?? '',
              bookings: r.bookings,
              spend: r.spend,
            }))
            .slice(0, limit)
        )
      );
  }

  getMonthlyBookings(): Observable<{ label: string; bookings: number; revenue: number }[]> {
    if (environment.useMockData) {
      return of(this.buildTrend(6, this.payments)).pipe(delay(250));
    }

    return this.api
      .get<{ _id: { year: number; month: number }; count: number; revenue: number }[]>(
        '/reports/bookings'
      )
      .pipe(
        map((rows) =>
          rows.slice(-6).map((r) => ({
            label: monthLabel(r._id.year, r._id.month),
            bookings: r.count,
            revenue: r.revenue,
          }))
        )
      );
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
