import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { AppNotification } from '../models/notification.model';
import { MOCK_NOTIFICATIONS } from '../data/mock-data';

/** Backend rows use Mongo _id - normalize to the app model. */
function mapNotification(raw: Partial<AppNotification> & { _id?: string }): AppNotification {
  return {
    ...(raw as AppNotification),
    id: (raw._id ?? raw.id) as string,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly items = signal<AppNotification[]>(environment.useMockData ? MOCK_NOTIFICATIONS : []);

  private api = inject(ApiService);

  readonly notifications = this.items.asReadonly();
  readonly unread = computed(() => this.items().filter((n) => !n.isRead).length);

  /** Pull the list (API mode) - call when the Profile screen opens. */
  load(): Observable<AppNotification[]> {
    if (environment.useMockData) {
      return of(this.items()).pipe(delay(200));
    }

    return this.api
      .get<AppNotification[]>('/notifications', { limit: 50 })
      .pipe(
        map((rows) => rows.map(mapNotification)),
        tap((list) => this.items.set(list))
      );
  }

  markRead(id: string): void {
    this.items.update((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    if (!environment.useMockData) {
      this.api.patch(`/notifications/${id}/read`).subscribe({ error: () => undefined });
    }
  }

  markAllRead(): void {
    this.items.update((list) => list.map((n) => ({ ...n, isRead: true })));
    if (!environment.useMockData) {
      this.api.patch('/notifications/read-all').subscribe({ error: () => undefined });
    }
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((n) => n.id !== id));
    if (!environment.useMockData) {
      this.api.delete(`/notifications/${id}`).subscribe({ error: () => undefined });
    }
  }

  /** Local toast-style notification - mock mode only; the server creates its own. */
  push(n: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): void {
    if (!environment.useMockData) return;

    const created: AppNotification = {
      ...n,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    this.items.update((list) => [created, ...list]);
  }
}
