import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { CateringPackage } from '../models/package.model';
import { MOCK_PACKAGES } from '../data/mock-data';

/** Backend rows use Mongo _id - normalize to the app's `id` model. */
function mapPackage(raw: Partial<CateringPackage> & { _id?: string }): CateringPackage {
  return { ...(raw as CateringPackage), id: (raw._id ?? raw.id) as string };
}

@Injectable({ providedIn: 'root' })
export class PackageService {
  private api = inject(ApiService);

  /** All active packages, popular ones first. */
  getPackages(search?: string, category?: string): Observable<CateringPackage[]> {
    if (environment.useMockData) {
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

    const params: Record<string, unknown> = { limit: 100 };
    if (category && category !== 'all') params["category"] = category;
    if (search) params["search"] = search;

    return this.api
      .get<CateringPackage[]>('/packages', params)
      .pipe(
        map((rows) =>
          rows
            .map(mapPackage)
            .sort((a, b) => Number(b.isPopular) - Number(a.isPopular))
        )
      );
  }

  getPopular(): Observable<CateringPackage[]> {
    if (environment.useMockData) {
      return of(MOCK_PACKAGES.filter((p) => p.isPopular)).pipe(delay(200));
    }

    return this.api
      .get<CateringPackage[]>('/packages', { isPopular: true, limit: 100 })
      .pipe(map((rows) => rows.map(mapPackage)));
  }

  getByIdOrSlug(idOrSlug: string): Observable<CateringPackage | undefined> {
    if (environment.useMockData) {
      return of(MOCK_PACKAGES.find((p) => p.id === idOrSlug || p.slug === idOrSlug)).pipe(delay(200));
    }

    return this.api
      .get<CateringPackage>(`/packages/${idOrSlug}`)
      .pipe(
        map(mapPackage),
        catchError(() => of(undefined))
      );
  }
}
