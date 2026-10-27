import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { CartService } from '../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  constructor(
    public cart: CartService,
    private router: Router,
    private alert: AlertController
  ) {}

  ngOnInit(): void {
    if (!this.cart.hasItems()) {
      this.router.navigateByUrl('/tabs/packages', { replaceUrl: true });
    }
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  packageLineTotal(): number {
    const d = this.cart.state();
    return d.package ? d.package.pricePerHead * d.guestCount : 0;
  }

  async removeAddon(menuItemId: string, name: string): Promise<void> {
    const alert = await this.alert.create({
      header: 'Remove item?',
      message: `${name} will be removed from your order.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => this.cart.removeItem(menuItemId),
        },
      ],
    });
    await alert.present();
  }

  proceed(): void {
    this.router.navigateByUrl('/payment', );
  }
}





