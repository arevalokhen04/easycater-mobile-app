import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AuthResponse, User } from '../models/user.model';
import { MOCK_USER } from '../data/mock-data';

const TOKEN_KEY = 'easycater.token';
const USER_KEY = 'easycater.user';

/**
 * Mock authentication so the app is runnable before the API is connected.
 * Swap the `of(...)` bodies for `this.api.post<AuthResponse>('/auth/login', ...)`
 * when you wire up the backend - the public surface stays the same.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  private currentUser = signal<User | null>(this.restoreUser());

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  login(email: string, password: string): Observable<AuthResponse> {
    if (!email || !password) {
      return throwError(() => new Error('Email and password are required'));
    }

    const user: User = { ...MOCK_USER, email };
    const response: AuthResponse = { user, token: `mock-token-${Date.now()}` };

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.token.set(response.token);
    this.currentUser.set(user);

    return of(response).pipe(delay(400));
  }

  register(payload: { name: string; email: string; password: string; phone?: string }): Observable<AuthResponse> {
    if (!payload.name || !payload.email || !payload.password) {
      return throwError(() => new Error('All fields are required'));
    }

    const user: User = {
      id: `u-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    const response: AuthResponse = { user, token: `mock-token-${Date.now()}` };

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.token.set(response.token);
    this.currentUser.set(user);

    return of(response).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  updateProfile(changes: Partial<User>): void {
    const updated = { ...(this.currentUser() ?? MOCK_USER), ...changes };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this.currentUser.set(updated);
  }

  private restoreUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
