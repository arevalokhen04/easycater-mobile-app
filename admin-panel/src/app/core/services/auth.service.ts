import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

const TOKEN_KEY = 'easycater.admin.token';
const USER_KEY = 'easycater.admin.user';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

const DEMO_ADMIN: AdminAccount = {
  id: 'admin-1',
  name: 'EasyCater Admin',
  email: 'admin@easycater.com',
  role: 'admin',
};

/**
 * Mock admin auth. Swap the `of(...)` bodies for
 * `this.api.post<AuthResponse>('/auth/login', ...)` when wiring the backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private currentUser = signal<AdminAccount | null>(this.restore());

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  login(email: string, password: string): Observable<{ user: AdminAccount; token: string }> {
    if (!email.trim() || !password) {
      return throwError(() => new Error('Email and password are required'));
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return throwError(() => new Error('Enter a valid email address'));
    }

    const account: AdminAccount = { ...DEMO_ADMIN, email: email.trim() };
    const token = `mock-admin-token-${Date.now()}`;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(account));
    this.token.set(token);
    this.currentUser.set(account);

    return of({ user: account, token }).pipe(delay(400));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private restore(): AdminAccount | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminAccount;
    } catch {
      return null;
    }
  }
}
