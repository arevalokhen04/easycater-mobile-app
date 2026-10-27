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
    this.data.toggleCustomerActive(c.id);
    this.load();
    this.notify(`${c.name} is now ${c.isActive ? 'disabled' : 'enabled'}`);
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
            this.data.deleteCustomer(c.id);
            this.load();
            this.notify('Customer deleted');
          },
        },
      ],
    });
    await alert.present();
  }

  private load(): void {
    this.data.getCustomers(this.search()).subscribe((list) => this.customers.set(list));
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
