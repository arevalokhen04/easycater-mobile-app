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
      inputs: [
        { name: 'name', placeholder: 'Package name', type: 'text' },
        { name: 'price', placeholder: 'Price per head', type: 'number' },
        { name: 'category', placeholder: 'wedding | corporate | birthday | other', type: 'text' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: (data: Record<string, string>) => {
            if (!data['name']?.trim()) return false;
            this.data
              .savePackage({
                name: data['name'].trim(),
                pricePerHead: Number(data['price']) || 0,
                category: (data['category'] || 'other').toLowerCase(),
              })
              .subscribe(() => {
                this.load();
                this.notify('Package created');
              });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  toggleActive(pkg: AdminPackage): void {
    this.data.togglePackageActive(pkg.id);
    this.load();
    this.notify(`${pkg.name} is now ${pkg.isActive ? 'hidden' : 'visible'}`);
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
            this.data.deletePackage(pkg.id);
            this.load();
            this.notify('Package deleted');
          },
        },
      ],
    });
    await alert.present();
  }

  private load(): void {
    this.data.getPackages(this.search()).subscribe((list) => this.packages.set(list));
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
