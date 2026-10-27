import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

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

  /** Guards against a double-tap stacking two loading overlays. */
  readonly busy = signal(false);

  private redirect = '/dashboard';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingController
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
    const loader = await this.loading.create({ message: 'Signing in...' });
    await loader.present();

    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: () => {
        loader.dismiss();
        this.router.navigateByUrl(this.redirect, { replaceUrl: true });
      },
      error: (err: Error) => {
        loader.dismiss();
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
