import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { PackageService } from '../core/services/package.service';
import { CartService } from '../core/services/cart.service';
import { CateringPackage } from '../core/models/package.model';

@Component({
  selector: 'app-package-details',
  standalone: false,
  templateUrl: './package-details.page.html',
  styleUrls: ['./package-details.page.scss'],
})
export class PackageDetailsPage implements OnInit {
  readonly pkg = signal<CateringPackage | undefined>(undefined);
  readonly guestCount = signal(0);
  readonly loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: PackageService,
    private cart: CartService,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.service.getByIdOrSlug(id).subscribe((found) => {
      this.pkg.set(found);
      if (found) {
        this.guestCount.set(Math.max(found.minGuests, 20));
        this.loading.set(false);
        return;
      }
      this.loading.set(false);
      this.notify('That package is no longer available');
      this.router.navigateByUrl('/tabs/packages', { replaceUrl: true });
    });
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  changeGuests(delta: number): void {
    const pkg = this.pkg();
    if (!pkg) return;
    const next = this.guestCount() + delta;
    this.guestCount.set(Math.min(Math.max(next, pkg.minGuests), pkg.maxGuests));
  }

  get estimatedTotal(): number {
    const pkg = this.pkg();
    if (!pkg) return 0;
    return pkg.pricePerHead * this.guestCount();
  }

  book(): void {
    const pkg = this.pkg();
    if (!pkg) return;
    this.cart.selectPackage(pkg, this.guestCount());
    this.router.navigateByUrl('/booking');
  }

  private async notify(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, position: 'bottom' });
    await t.present();
  }
}





