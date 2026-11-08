import { Component, OnInit, signal } from '@angular/core';
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

  async createItem(): Promise<void> {
    const alert = await this.alert.create({
      header: 'New menu item',
      inputs: [
        { name: 'name', placeholder: 'Dish name', type: 'text' },
        { name: 'price', placeholder: 'Price', type: 'number' },
        {
          name: 'category',
          placeholder: 'appetizer | main-course | sides | dessert | drinks',
          type: 'text',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: (data: Record<string, string>) => {
            if (!data['name']?.trim()) return false;
            this.data
              .saveMenuItem({
                name: data['name'].trim(),
                price: Number(data['price']) || 0,
                category: (data['category'] || 'main-course').toLowerCase(),
              })
              .subscribe({
                next: () => {
                  this.load();
                  this.notify('Menu item created');
                },
                error: (err: Error) => this.notify(err.message),
              });
            return true;
          },
        },
      ],
    });
    await alert.present();
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
