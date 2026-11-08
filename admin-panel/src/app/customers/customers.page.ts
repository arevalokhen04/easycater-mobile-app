import { Component, OnInit, signal } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

import { AdminDataService } from '../core/services/admin-data.service';
import { AdminUser } from '../core/models/admin.models';

@Component({
  selector: 'app-customers-admin',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
  standalone: false,
})
export class CustomersAdminPage implements OnInit {
  readonly customers = signal<AdminUser[]>([]);
  readonly search = signal('');
  readonly loading = signal(true);
  readonly busy = signal(false);

  constructor(
    private data: AdminDataService,
    private alert: AlertController,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    this.load();
  }

  money(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('');
  }

  onSearch(value: string | undefined): void {
    this.search.set(value ?? '');
    this.load();
  }

  toggleActive(c: AdminUser): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.data.toggleCustomerActive(c.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.load();
        this.notify(`${c.name} is now ${c.isActive ? 'disabled' : 'enabled'}`);
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.notify(err.message);
      },
    });
  }

  async confirmDelete(c: AdminUser): Promise<void> {
    const alert = await this.alert.create({
      header: 'Delete customer?',
      message: `${c.name}'s account will be removed permanently.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (this.busy()) return;
            this.busy.set(true);
            this.data.deleteCustomer(c.id).subscribe({
              next: () => {
                this.busy.set(false);
                this.load();
                this.notify('Customer deleted');
              },
              error: (err: Error) => {
                this.busy.set(false);
                this.notify(err.message);
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private load(): void {
    this.loading.set(true);
    this.data.getCustomers(this.search()).subscribe({
      next: (list) => {
        this.customers.set(list);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.notify(err.message);
      },
    });
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
