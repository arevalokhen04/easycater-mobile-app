import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  showPassword = false;
  agreed = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private loading: LoadingController,
    private alert: AlertController
  ) {}

  async submit(): Promise<void> {
    if (!this.name().trim() || !this.email().trim() || !this.password() || !this.confirmPassword()) {
      await this.show('Please fill in all required fields', 'Missing details');
      return;
    }
    if (this.password().length < 8) {
      await this.show('Password must be at least 8 characters', 'Weak password');
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      await this.show('Passwords do not match', 'Check your input');
      return;
    }
    if (!this.agreed) {
      await this.show('Please accept the terms and conditions', 'Almost there');
      return;
    }

    const loader = await this.loading.create({ message: 'Creating account...' });
    await loader.present();

    this.auth
      .register({
        name: this.name().trim(),
        email: this.email().trim(),
        password: this.password(),
        phone: this.phone().trim(),
      })
      .subscribe({
        next: () => {
          loader.dismiss();
          this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
        },
        error: (err: Error) => {
          loader.dismiss();
          this.show(err.message, 'Registration failed');
        },
      });
  }

  private async show(message: string, header: string): Promise<void> {
    const alert = await this.alert.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}



