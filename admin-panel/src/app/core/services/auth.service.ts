import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

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

interface AuthApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthApiResponse {
  user: AuthApiUser;
  token: string;
}

/**
 * Admin authentication. Mock mode accepts any valid email (fixtures only);
 * API mode signs in against the backend and requires the admin role.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private api = inject(ApiService);

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

    if (environment.useMockData) {
      const account: AdminAccount = { ...DEMO_ADMIN, email: email.trim() };
      const token = `mock-admin-token-${Date.now()}`;
      this.persist(account, token);
      return of({ user: account, token }).pipe(delay(400));
    }

    return this.api.post<AuthApiResponse>('/auth/login', { email, password }).pipe(
      map((res) => {
        if (res.user.role !== 'admin') {
          throw new Error('This account is not an admin');
        }
        const account: AdminAccount = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: 'admin',
        };
        this.persist(account, res.token);
        return { user: account, token: res.token };
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private persist(account: AdminAccount, token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(account));
    this.token.set(token);
    this.currentUser.set(account);
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
