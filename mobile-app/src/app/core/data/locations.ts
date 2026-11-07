/**
 * Service-area data: EasyCater only caters events inside General Tinio,
 * Nueva Ecija. Addresses are limited to its 13 barangays and the venue
 * field offers real venues around town as one-tap suggestions.
 */

export const SERVICE_TOWN = 'General Tinio, Nueva Ecija';

/** The 13 barangays of General Tinio (source: philatlas.com). */
export const GENERAL_TINIO_BARANGAYS = [
  'Bago',
  'Concepcion',
  'Nazareth',
  'Padolina',
  'Palale',
  'Pias',
  'Poblacion Central',
  'Poblacion East',
  'Poblacion West',
  'Pulong Matong',
  'Rio Chico',
  'Sampaguita',
  'San Pedro',
] as const;

export type Barangay = (typeof GENERAL_TINIO_BARANGAYS)[number];

export function barangayAddress(barangay: string): string {
  return `Brgy. ${barangay}, ${SERVICE_TOWN}`;
}

/** Recovers the barangay from a stored full address ('' if not one of ours). */
export function barangayFromAddress(address: string): string {
  const match = new RegExp(`^Brgy\\. (.+), ${SERVICE_TOWN}$`).exec(address.trim());
  return match ? match[1] : '';
}

export interface VenueSuggestion {
  name: string;
  hint: string;
}

/** Real venues around General Tinio (municipal tourism listing + local resorts). */
export const VENUE_SUGGESTIONS: VenueSuggestion[] = [
  { name: 'EJJ Resort and Event Center', hint: 'Resort & event center' },
  { name: "Symvy's Garden Resort", hint: 'Garden resort' },
  { name: 'Tahanan sa Papaya Resort and Garden', hint: 'Private pool & garden' },
  { name: 'Nueva Ecija Private Resort and Events Place', hint: 'Events place' },
  { name: 'Palas Resort', hint: 'Resort' },
  { name: 'Sierra Casas Hotel', hint: 'Hotel' },
  { name: 'Hiding Place Mission Farm', hint: 'Farm venue' },
  { name: 'General Tinio Covered Court', hint: 'Public venue' },
];
