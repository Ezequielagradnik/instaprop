export interface Property {
  id: number;
  price_usd: number;
  price_display: string;
  address: string;
  neighborhood: string;
  type: 'monoambiente' | '2amb' | '3amb' | 'casa' | 'ph' | 'loft';
  bedrooms: number | null;
  area_m2: number | null;
  badge: string;
  match_score: number;
  description: string;
  tags: string[];
  image_url: string | null;
  gradient: string;
  likes: number;
  featured: boolean;
}

export interface User {
  name: string;
  email: string;
}

export interface UserPrefs {
  zones: string[];
  types: string[];
  rooms: string[];
  features: string[];
  budget: number;
}

export type Tab = 'feed' | 'search' | 'saved' | 'community' | 'profile';
export type FilterType = 'all' | 'mono' | '2amb' | '3amb' | 'casa' | 'lujo';
