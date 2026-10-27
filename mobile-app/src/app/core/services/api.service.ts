import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Thin wrapper over the EasyCater backend.
 *
 * Every method unwraps the `data` payload of the API envelope
 * ({ success, data, meta }) so callers never deal with the wrapper shape.
 *
 * Replace `MOCK_*` service bodies with these once the backend is running.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.http
      .get<ApiEnvelope<T>>(`${this.baseUrl}${path}`, { params: params as never })
      .pipe(map((res) => res.data));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body).pipe(map((res) => res.data));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body).pipe(map((res) => res.data));
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http
      .patch<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body ?? {})
      .pipe(map((res) => res.data));
  }

  delete<T = void>(path: string): Observable<T> {
    return this.http.delete<ApiEnvelope<T>>(`${this.baseUrl}${path}`).pipe(map((res) => res.data));
  }
}
