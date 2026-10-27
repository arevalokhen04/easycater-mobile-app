import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

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
  showPassword = false;

  private redirect = '/tabs/home';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loading: LoadingController,
    private alert: AlertController
  ) {
    this.redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/tabs/home';
  }

  async submit(): Promise<void> {
    if (!this.email().trim() || !this.password()) {
      await this.showAlert('Please fill in both fields', 'Missing details');
      return;
    }

    const loader = await this.loading.create({ message: 'Signing in...' });
    await loader.present();

    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: () => {
        loader.dismiss();
        this.router.navigateByUrl(this.redirect, { replaceUrl: true });
      },
      error: (err: Error) => {
        loader.dismiss();
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



