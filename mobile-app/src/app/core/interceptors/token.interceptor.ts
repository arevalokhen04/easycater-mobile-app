import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

/** Attaches the JWT to every outgoing request once the user is authenticated. */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();

  if (!token || !req.url.includes('/api/')) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
