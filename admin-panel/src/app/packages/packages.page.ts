import { Component, OnInit, signal } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';

import { AdminDataService } from '../core/services/admin-data.service';
import { AdminPackage } from '../core/models/admin.models';

@Component({
  selector: 'app-packages-admin',
  templateUrl: './packages.page.html',
  styleUrls: ['./packages.page.scss'],
  standalone: false,
})
export class PackagesAdminPage implements OnInit {
  readonly packages = signal<AdminPackage[]>([]);
  readonly search = signal('');
  readonly loading = signal(true);
  readonly busy = signal(false);

  /** Constrained choices (error prevention) - no free-text categories. */
  readonly categoryChoices = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'christening', label: 'Christening' },
    { value: 'graduation', label: 'Graduation' },
    { value: 'other', label: 'Other' },
  ];

  constructor(
    private data: AdminDataService,
    private alert: AlertController,
    private toast: ToastController,
    private modal: ModalController
  ) {}

  ngOnInit(): void {
    this.load();
  }

  money(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  onSearch(value: string | undefined): void {
    this.search.set(value ?? '');
    this.load();
  }

  async createPackage(): Promise<void> {
    const alert = await this.alert.create({
      header: 'New package',
      message: 'Pick a category, then set the name and price per head.',
      inputs: [
        { name: 'name', placeholder: 'Package name', type: 'text' },
        { name: 'price', placeholder: 'Price per head (PHP)', type: 'number', min: 1 },
        ...this.categoryChoices.map((c, i) => ({
          name: 'category',
          type: 'radio' as const,
          label: c.label,
          value: c.value,
          checked: i === 0,
        })),
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: (data: Record<string, string>) => {
            const name = data['name']?.trim();
            const price = Number(data['price']);
            // Error prevention: validate before anything is saved.
            if (!name) {
              this.notify('Enter the package name first');
              return false;
            }
            if (!price || price <= 0) {
              this.notify('Enter a price above PHP 0');
              return false;
            }
            this.busy.set(true);
            this.data
              .savePackage({
                name,
                pricePerHead: price,
                category: data['category'] || 'other',
              })
              .subscribe({
                next: () => {
                  this.busy.set(false);
                  this.load();
                  this.notify('Package created');
                },
                error: (err: Error) => {
                  this.busy.set(false);
                  this.notify(err.message);
                },
              });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  toggleActive(pkg: AdminPackage): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.data.togglePackageActive(pkg.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.load();
        this.notify(`${pkg.name} is now ${pkg.isActive ? 'hidden' : 'visible'}`);
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.notify(err.message);
      },
    });
  }

  async confirmDelete(pkg: AdminPackage): Promise<void> {
    const alert = await this.alert.create({
      header: 'Delete package?',
      message: `${pkg.name} will be removed permanently.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.data.deletePackage(pkg.id).subscribe({
              next: () => {
                this.load();
                this.notify('Package deleted');
              },
              error: (err: Error) => this.notify(err.message),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private load(): void {
    this.loading.set(true);
    this.data.getPackages(this.search()).subscribe({
      next: (list) => {
        this.packages.set(list);
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
