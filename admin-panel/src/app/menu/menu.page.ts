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
              .subscribe(() => {
                this.load();
                this.notify('Menu item created');
              });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  toggleAvailable(item: AdminMenuItem): void {
    this.data.toggleMenuItem(item.id);
    this.load();
    this.notify(`${item.name} is now ${item.isAvailable ? 'unavailable' : 'available'}`);
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
            this.data.deleteMenuItem(item.id);
            this.load();
            this.notify('Menu item deleted');
          },
        },
      ],
    });
    await alert.present();
  }

  private load(): void {
    this.data.getMenu(this.search(), this.category()).subscribe((list) => this.items.set(list));
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
