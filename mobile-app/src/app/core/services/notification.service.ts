import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { AppNotification } from '../models/notification.model';
import { MOCK_NOTIFICATIONS } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly items = signal<AppNotification[]>(MOCK_NOTIFICATIONS);

  readonly notifications = this.items.asReadonly();
  readonly unread = computed(() => this.items().filter((n) => !n.isRead).length);

  getAll(): Observable<AppNotification[]> {
    return of(this.items()).pipe(delay(200));
  }

  markRead(id: string): void {
    this.items.update((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  markAllRead(): void {
    this.items.update((list) => list.map((n) => ({ ...n, isRead: true })));
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((n) => n.id !== id));
  }

  push(n: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): void {
    const created: AppNotification = {
      ...n,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    this.items.update((list) => [created, ...list]);
  }
}
