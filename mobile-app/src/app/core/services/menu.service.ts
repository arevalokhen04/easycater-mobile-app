import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { MenuCategory, MenuItem } from '../models/menu-item.model';
import { MOCK_MENU } from '../data/mock-data';

/** Backend rows use Mongo _id; the package ref maps to the app's packageId. */
function mapMenuItem(raw: Partial<MenuItem> & { _id?: string }): MenuItem {
  return {
    ...(raw as MenuItem),
    id: (raw._id ?? raw.id) as string,
    packageId: (raw.packageId ?? null) as string | null,
  };
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private api = inject(ApiService);

  getItems(search?: string, category?: string, dietary?: string): Observable<MenuItem[]> {
    if (environment.useMockData) {
      let items = MOCK_MENU.filter((m) => m.isAvailable);

      if (category && category !== 'all') {
        items = items.filter((m) => m.category === category);
      }
      if (dietary && dietary !== 'all') {
        items = items.filter((m) => m.dietary.includes(dietary));
      }
      if (search) {
        const q = search.toLowerCase();
        items = items.filter((m) => m.name.toLowerCase().includes(q));
      }

      return of(items).pipe(delay(200));
    }

    const params: Record<string, unknown> = {};
    if (category && category !== 'all') params["category"] = category;
    if (dietary && dietary !== 'all') params["dietary"] = dietary;
    if (search) params["search"] = search;

    return this.api
      .get<MenuItem[]>('/menu', params)
      .pipe(map((rows) => rows.map(mapMenuItem).filter((m) => m.isAvailable)));
  }

  getFeatured(): Observable<MenuItem[]> {
    if (environment.useMockData) {
      return of(MOCK_MENU.filter((m) => m.isFeatured && m.isAvailable)).pipe(delay(200));
    }

    return this.api
      .get<MenuItem[]>('/menu', { isFeatured: true })
      .pipe(map((rows) => rows.map(mapMenuItem).filter((m) => m.isAvailable)));
  }

  getById(id: string): Observable<MenuItem | undefined> {
    if (environment.useMockData) {
      return of(MOCK_MENU.find((m) => m.id === id)).pipe(delay(150));
    }

    return this.api
      .get<MenuItem>(`/menu/${id}`)
      .pipe(
        map(mapMenuItem),
        catchError(() => of(undefined))
      );
  }

  categories(): MenuCategory[] {
    return ['appetizer', 'main-course', 'sides', 'dessert', 'drinks'];
  }

  label(category: MenuCategory): string {
    const map: Record<MenuCategory, string> = {
      appetizer: 'Appetizer',
      'main-course': 'Main Course',
      dessert: 'Dessert',
      drinks: 'Drinks',
      sides: 'Sides',
    };
    return map[category] ?? category;
  }
}
