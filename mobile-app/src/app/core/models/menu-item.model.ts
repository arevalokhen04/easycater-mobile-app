export type MenuCategory = 'appetizer' | 'main-course' | 'dessert' | 'drinks' | 'sides';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  dietary: string[];
  packageId: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
}
