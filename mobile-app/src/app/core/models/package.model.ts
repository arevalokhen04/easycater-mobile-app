import { MenuItem } from './menu-item.model';

export type PackageCategory =
  | 'wedding'
  | 'corporate'
  | 'birthday'
  | 'christening'
  | 'graduation'
  | 'other';

export interface CateringPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricePerHead: number;
  minGuests: number;
  maxGuests: number;
  category: PackageCategory;
  image: string;
  images?: string[];
  inclusions: string[];
  isPopular: boolean;
  rating: number;
  menu?: MenuItem[];
}
