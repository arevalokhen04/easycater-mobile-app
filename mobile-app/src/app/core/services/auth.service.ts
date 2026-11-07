import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { AuthResponse, User } from '../models/user.model';
import { MOCK_USER } from '../data/mock-data';

const TOKEN_KEY = 'easycater.token';
const USER_KEY = 'easycater.user';

/**
 * Authentication. In mock mode (environment.useMockData) it serves fixtures so
 * the app runs before the API is connected; otherwise it talks to the backend.
 * The public surface stays the same either way.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private api = inject(ApiService);

  private currentUser = signal<User | null>(this.restoreUser());

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  login(email: string, password: string): Observable<AuthResponse> {
    if (!email || !password) {
      return throwError(() => new Error('Email and password are required'));
    }

    if (environment.useMockData) {
      const user: User = { ...MOCK_USER, email };
      const response: AuthResponse = { user, token: `mock-token-${Date.now()}` };
      this.persist(response);
      return of(response).pipe(delay(400));
    }

    return this.api
      .post<AuthResponse>('/auth/login', { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  register(payload: { name: string; email: string; password: string; phone?: string }): Observable<AuthResponse> {
    if (!payload.name || !payload.email || !payload.password) {
      return throwError(() => new Error('All fields are required'));
    }

    if (environment.useMockData) {
      const user: User = {
        id: `u-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: 'customer',
        createdAt: new Date().toISOString(),
      };
      const response: AuthResponse = { user, token: `mock-token-${Date.now()}` };
      this.persist(response);
      return of(response).pipe(delay(500));
    }

    return this.api
      .post<AuthResponse>('/auth/register', payload)
      .pipe(tap((res) => this.persist(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  updateProfile(changes: Partial<User>): Observable<User> {
    if (environment.useMockData) {
      const updated = { ...(this.currentUser() ?? MOCK_USER), ...changes };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      this.currentUser.set(updated);
      return of(updated).pipe(delay(300));
    }

    return this.api.put<User>('/auth/profile', changes).pipe(
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  /** Store token + user (backend already maps _id -> id via publicUser). */
  private persist(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.token.set(response.token);
    this.currentUser.set(response.user);
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
