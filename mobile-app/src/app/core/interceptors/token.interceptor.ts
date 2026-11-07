import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

/** Attaches the JWT to every outgoing request once the user is authenticated. */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();

  if (!token || !req.url.includes('/api/')) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

/**
 * Class adapter - `HTTP_INTERCEPTORS` (HttpClientModule) expects an
 * HttpInterceptor instance, not the bare functional interceptor.
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, handler: HttpHandler): Observable<HttpEvent<unknown>> {
    return tokenInterceptor(req, (r) => handler.handle(r));
  }
}
