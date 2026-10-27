import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MenuCategory, MenuItem } from '../models/menu-item.model';
import { MOCK_MENU } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class MenuService {
  getItems(search?: string, category?: string, dietary?: string): Observable<MenuItem[]> {
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

  getFeatured(): Observable<MenuItem[]> {
    return of(MOCK_MENU.filter((m) => m.isFeatured && m.isAvailable)).pipe(delay(200));
  }

  getById(id: string): Observable<MenuItem | undefined> {
    return of(MOCK_MENU.find((m) => m.id === id)).pipe(delay(150));
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
