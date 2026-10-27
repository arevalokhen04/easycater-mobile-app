import { Component, OnInit, signal } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { MenuService } from '../core/services/menu.service';
import { CartService } from '../core/services/cart.service';
import { MenuCategory, MenuItem } from '../core/models/menu-item.model';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  categories: MenuCategory[] = [];
  readonly items = signal<MenuItem[]>([]);
  readonly activeCategory = signal<MenuCategory | 'all'>('all');
  readonly search = signal('');

  constructor(
    private service: MenuService,
    public cart: CartService,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    this.categories = this.service.categories();
    this.load();
  }

  label(category: MenuCategory | 'all'): string {
    return category === 'all' ? 'All' : this.service.label(category);
  }

  selectCategory(category: MenuCategory | 'all'): void {
    this.activeCategory.set(category);
    this.load();
  }

  onSearch(value: string | undefined): void {
    this.search.set(value ?? '');
    this.load();
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  addToCart(item: MenuItem): void {
    if (!this.cart.hasItems()) {
      this.notify('Pick a package first, then add extras to it');
      return;
    }
    this.cart.addItem(item);
    this.notify(`${item.name} added to your order`);
  }

  quantityOf(menuItemId: string): number {
    return this.cart.state().addOns.find((a) => a.menuItemId === menuItemId)?.quantity ?? 0;
  }

  private load(): void {
    this.service.getItems(this.search(), this.activeCategory()).subscribe((list) => {
      this.items.set(list);
    });
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}



