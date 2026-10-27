import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/** Unwraps the `{ success, data }` envelope used by the EasyCater backend. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.http
      .get<ApiEnvelope<T>>(`${this.baseUrl}${path}`, { params: params as never })
      .pipe(map((r) => r.data));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body).pipe(map((r) => r.data));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body).pipe(map((r) => r.data));
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http.patch<ApiEnvelope<T>>(`${this.baseUrl}${path}`, body ?? {}).pipe(map((r) => r.data));
  }

  delete<T = void>(path: string): Observable<T> {
    return this.http.delete<ApiEnvelope<T>>(`${this.baseUrl}${path}`).pipe(map((r) => r.data));
  }
}
