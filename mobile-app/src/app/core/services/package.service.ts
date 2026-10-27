import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { CateringPackage } from '../models/package.model';
import { MOCK_PACKAGES } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class PackageService {
  /** All active packages, popular ones first. */
  getPackages(search?: string, category?: string): Observable<CateringPackage[]> {
    let items = [...MOCK_PACKAGES];

    if (category && category !== 'all') {
      items = items.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    return of(items.sort((a, b) => Number(b.isPopular) - Number(a.isPopular))).pipe(delay(250));
  }

  getPopular(): Observable<CateringPackage[]> {
    return of(MOCK_PACKAGES.filter((p) => p.isPopular)).pipe(delay(200));
  }

  getByIdOrSlug(idOrSlug: string): Observable<CateringPackage | undefined> {
    return of(MOCK_PACKAGES.find((p) => p.id === idOrSlug || p.slug === idOrSlug)).pipe(delay(200));
  }
}
