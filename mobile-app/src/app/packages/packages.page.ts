import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PackageService } from '../core/services/package.service';
import { PackageCategory, CateringPackage } from '../core/models/package.model';

@Component({
  selector: 'app-packages',
  standalone: false,
  templateUrl: './packages.page.html',
  styleUrls: ['./packages.page.scss'],
})
export class PackagesPage implements OnInit {
  readonly filters: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'wedding', label: 'Wedding' },
    { key: 'corporate', label: 'Corporate' },
    { key: 'birthday', label: 'Birthday' },
    { key: 'christening', label: 'Christening' },
    { key: 'other', label: 'Other' },
  ];

  readonly packages = signal<CateringPackage[]>([]);
  readonly activeFilter = signal('all');
  readonly search = signal('');
  readonly loading = signal(true);

  constructor(
    private service: PackageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Keep the search term in sync when Home's searchbar navigates here with ?q=
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      if (q !== this.search()) {
        this.search.set(q);
      }
      this.load();
    });
  }

  setFilter(key: string): void {
    this.activeFilter.set(key);
    this.load();
  }

  onSearch(value: string | undefined): void {
    this.search.set(value ?? '');
    this.load();
  }

  clearSearch(): void {
    this.search.set('');
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: null }, replaceUrl: true });
    this.load();
  }

  currency(value: number): string {
    return `PHP ${value.toLocaleString('en-PH')}`;
  }

  private load(): void {
    this.loading.set(true);
    this.service.getPackages(this.search(), this.activeFilter()).subscribe((list) => {
      this.packages.set(list);
      this.loading.set(false);
    });
  }
}



