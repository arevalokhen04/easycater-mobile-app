import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

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
  showPassword = false;

  private redirect = '/tabs/home';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertController
  ) {
    this.redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/tabs/home';
  }

  async submit(): Promise<void> {
    if (this.busy()) return;
    if (!this.email().trim() || !this.password()) {
      await this.showAlert('Please fill in both fields', 'Missing details');
      return;
    }

    // Inline button state instead of a blocking overlay - no stuck backdrops.
    this.busy.set(true);
    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: (res) => {
        this.busy.set(false);
        // This app is customers-only - admin accounts belong to the Admin app.
        if (res.user.role === 'admin') {
          this.auth.logout();
          this.showAlert(
            'This account is an admin. Please use the EasyCater Admin app to manage bookings.',
            'Admin account'
          );
          return;
        }
        this.router.navigateByUrl(this.redirect, { replaceUrl: true });
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.showAlert(err.message, 'Login failed');
      },
    });
  }

  /** Fills the form so the scaffold can be demoed without credentials. */
  useDemoAccount(): void {
    this.email.set('maria@example.com');
    this.password.set('Password123');
  }

  private async showAlert(message: string, header: string): Promise<void> {
    const alert = await this.alert.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}
