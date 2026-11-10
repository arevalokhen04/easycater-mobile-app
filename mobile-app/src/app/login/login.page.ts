import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  readonly email = signal('');
  readonly password = signal('');
  readonly busy = signal(false);
  readonly showPassword = signal(false);
  readonly error = signal('');

  private redirect = '/tabs/home';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/tabs/home';
  }

  submit(): void {
    if (this.busy()) return;
    this.error.set('');
    if (!this.email().trim() || !this.password()) {
      this.error.set('Please fill in both email and password.');
      return;
    }

    // Inline button state and error banner instead of blocking dialogs.
    this.busy.set(true);
    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: (res) => {
        this.busy.set(false);
        // This app is customers-only - admin accounts belong to the Admin app.
        if (res.user.role === 'admin') {
          this.auth.logout();
          this.error.set('This account is an admin. Please use the EasyCater Admin app to manage bookings.');
          return;
        }
        this.router.navigateByUrl(this.redirect, { replaceUrl: true });
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.error.set(err.message);
      },
    });
  }

  /** Fills the form so the scaffold can be demoed without credentials. */
  useDemoAccount(): void {
    this.email.set('maria@example.com');
    this.password.set('Password123');
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
