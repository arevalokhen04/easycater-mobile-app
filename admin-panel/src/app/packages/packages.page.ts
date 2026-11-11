import { Component, OnInit, computed, signal } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

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

  // ---- create-package modal state ----
  readonly createOpen = signal(false);
  readonly cName = signal('');
  readonly cPrice = signal('');
  readonly cCategory = signal('wedding');
  readonly cImageUrl = signal('');
  readonly cPhoto = signal('');
  readonly cRating = signal('4.5');
  readonly cPreview = computed(() => this.cPhoto() || this.cImageUrl().trim());

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

  onSearch(value: string | undefined): void {
    this.search.set(value ?? '');
    this.load();
  }

  /** Opens the create modal with fresh fields (photo + rating included). */
  openCreate(): void {
    this.cName.set('');
    this.cPrice.set('');
    this.cCategory.set('wedding');
    this.cImageUrl.set('');
    this.cPhoto.set('');
    this.cRating.set('4.5');
    this.createOpen.set(true);
  }

  closeCreate(): void {
    this.createOpen.set(false);
  }

  /** Reads the picked photo into a data URL for the preview and payload. */
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.cPhoto.set(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  async confirmCreate(): Promise<void> {
    if (this.busy()) return;
    const name = this.cName().trim();
    const price = Number(this.cPrice());
    const rating = Math.min(5, Math.max(0, Number(this.cRating()) || 0));
    if (!name) {
      this.notify('Enter the package name first');
      return;
    }
    if (!price || price <= 0) {
      this.notify('Enter a price above PHP 0');
      return;
    }
    const image = this.cPhoto() || this.cImageUrl().trim();
    this.busy.set(true);
    this.data
      .savePackage({
        name,
        pricePerHead: price,
        category: this.cCategory(),
        image,
        rating,
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.closeCreate();
          this.load();
          this.notify('Package created');
        },
        error: (err: Error) => {
          this.busy.set(false);
          this.notify(err.message);
        },
      });
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
