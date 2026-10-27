import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Sends unauthenticated visitors to /login, preserving where they wanted to go. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

/** Keeps logged-in users out of /login and /register. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() ? router.createUrlTree(['/tabs/home']) : true;
};
