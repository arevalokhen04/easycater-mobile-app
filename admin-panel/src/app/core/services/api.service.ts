import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, map, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Unwraps the `{ success, data }` envelope used by the EasyCater backend and
 * turns backend error messages into plain-language Errors for the screens.
 *
 * Auto-connect: candidate backend URLs are probed against /health and the
 * first working one is cached, so the phone APKs survive IP changes between
 * the PC hotspot (192.168.137.1) and regular Wi-Fi networks.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private baseReady: Promise<string> | null = null;

  private resolveBase(): Promise<string> {
    if (!this.baseReady) {
      this.baseReady = this.probeBase().catch(() => this.baseUrl);
    }
    return this.baseReady;
  }

  private async probeBase(): Promise<string> {
    const stored = localStorage.getItem('ec_api') || '';
    const candidates = Array.from(
      new Set([stored, environment.apiUrl, 'http://192.168.137.1:4000/api/v1'].filter(Boolean))
    );
    for (const candidate of candidates) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 1500);
        const res = await fetch(`${candidate}/health`, { signal: ctrl.signal });
        clearTimeout(timer);
        const json = (await res.json()) as ApiEnvelope<{ status: string }>;
        if (json && json.data && json.data.status === 'ok') {
          localStorage.setItem('ec_api', candidate);
          return candidate;
        }
      } catch {
        // try the next candidate
      }
    }
    throw new Error(
      'Cannot reach the EasyCater server. Make sure the backend is running and this device is connected to the same Wi-Fi/hotspot.'
    );
  }

  private call<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown, params?: Record<string, unknown>): Observable<T> {
    return from(this.resolveBase()).pipe(
      switchMap((base) =>
        this.http.request<ApiEnvelope<T>>(method, `${base}${path}`, {
          body,
          params: params as never,
        })
      ),
      map((r) => r.data),
      catchError(this.toPlainError)
    );
  }

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.call<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.call<T>('POST', path, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.call<T>('PUT', path, body);
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.call<T>('PATCH', path, body ?? {});
  }

  delete<T = void>(path: string): Observable<T> {
    return this.call<T>('DELETE', path);
  }

  private toPlainError(err: unknown): Observable<never> {
    const message =
      (err as { error?: { message?: string } })?.error?.message ||
      'Something went wrong - please try again';
    return throwError(() => new Error(message));
  }
}
