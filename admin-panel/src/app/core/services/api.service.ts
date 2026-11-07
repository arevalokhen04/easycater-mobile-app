import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Unwraps the `{ success, data }` envelope used by the EasyCater backend and
 * turns backend error messages into plain-language Errors for the screens.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.http
      .get<ApiEnvelope<T>>(`${this.baseUrl}${path}`, { params: params as never })
      .pipe(map((r) => r.data), catchError(this.toPlainError));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((r) => r.data), catchError(this.toPlainError));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((r) => r.data), catchError(this.toPlainError));
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http
      .patch<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body ?? {})
      .pipe(map((r) => r.data), catchError(this.toPlainError));
  }

  delete<T = void>(path: string): Observable<T> {
    return this.http
      .delete<ApiEnvelope<T>>(`${this.baseUrl}${path}`)
      .pipe(map((r) => r.data as T), catchError(this.toPlainError));
  }

  private toPlainError(err: unknown): Observable<never> {
    const message =
      (err as { error?: { message?: string } })?.error?.message ||
      'Something went wrong - please try again';
    return throwError(() => new Error(message));
  }
}
