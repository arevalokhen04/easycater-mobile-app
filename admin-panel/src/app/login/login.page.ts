import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly error = signal('');

  /** Inline button state - no blocking overlay, no stuck backdrops. */
  readonly busy = signal(false);

  private redirect = '/dashboard';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/dashboard';
  }

  async submit(): Promise<void> {
    if (this.busy()) return;
    this.error.set('');
    if (!this.email().trim() || !this.password()) {
      this.error.set('Enter both your email and password.');
      return;
    }

    this.busy.set(true);
    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigateByUrl(this.redirect, { replaceUrl: true });
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.error.set(err.message);
      },
    });
  }

  fillDemo(): void {
    this.email.set('admin@easycater.com');
    this.password.set('Admin123!');
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
