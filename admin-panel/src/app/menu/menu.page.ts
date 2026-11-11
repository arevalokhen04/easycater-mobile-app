import { Component, OnInit, computed, signal } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

import { AdminDataService } from '../core/services/admin-data.service';
import { AdminMenuItem } from '../core/models/admin.models';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: false,
})
export class MenuAdminPage implements OnInit {
  readonly categories = ['all', 'appetizer', 'main-course', 'sides', 'dessert', 'drinks'];

  readonly items = signal<AdminMenuItem[]>([]);
  readonly search = signal('');
  readonly category = signal('all');
  readonly loading = signal(true);
  readonly busy = signal(false);

  /** Filter chips skip the "all" entry for the create form's dropdown. */
  readonly categoryChoices = this.categories.filter((c) => c !== 'all');

  // ---- create-menu-item modal state ----
  readonly createOpen = signal(false);
  readonly cName = signal('');
  readonly cPrice = signal('');
  readonly cCategory = signal('main-course');
  readonly cImageUrl = signal('');
  readonly cPhoto = signal('');
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

  setCategory(cat: string): void {
    this.category.set(cat);
    this.load();
  }

  /** Opens the create modal with fresh fields (photo included). */
  openCreate(): void {
    this.cName.set('');
    this.cPrice.set('');
    this.cCategory.set('main-course');
    this.cImageUrl.set('');
    this.cPhoto.set('');
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
    if (!name) {
      this.notify('Enter the dish name first');
      return;
    }
    if (!price || price <= 0) {
      this.notify('Enter a price above PHP 0');
      return;
    }
    const image = this.cPhoto() || this.cImageUrl().trim();
    this.busy.set(true);
    this.data
      .saveMenuItem({
        name,
        price,
        category: this.cCategory(),
        image,
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.closeCreate();
          this.load();
          this.notify('Menu item created');
        },
        error: (err: Error) => {
          this.busy.set(false);
          this.notify(err.message);
        },
      });
  }

  toggleAvailable(item: AdminMenuItem): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.data.toggleMenuItem(item.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.load();
        this.notify(`${item.name} is now ${item.isAvailable ? 'unavailable' : 'available'}`);
      },
      error: (err: Error) => {
        this.busy.set(false);
        this.notify(err.message);
      },
    });
  }

  async confirmDelete(item: AdminMenuItem): Promise<void> {
    const alert = await this.alert.create({
      header: 'Delete menu item?',
      message: `${item.name} will be removed permanently.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (this.busy()) return;
            this.busy.set(true);
            this.data.deleteMenuItem(item.id).subscribe({
              next: () => {
                this.busy.set(false);
                this.load();
                this.notify('Menu item deleted');
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
    this.data.getMenu(this.search(), this.category()).subscribe({
      next: (list) => {
        this.items.set(list);
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
