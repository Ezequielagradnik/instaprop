export interface Property {
  id: number;
  price_usd: number;
  price_display: string;
  address: string;
  neighborhood: string;
  type: 'monoambiente' | '2amb' | '3amb' | 'casa' | 'ph' | 'loft';
  operation_type?: 'venta' | 'alquiler' | 'temporario';
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
  // Trust / extras
  verified?: boolean;
  response_time?: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

export interface UserPrefs {
  zones: string[];
  types: string[];
  rooms: string[];
  features: string[];
  budget: number;
}

export type Tab = 'home' | 'messages' | 'video' | 'community' | 'profile' | 'map';
export type FilterType = 'all' | 'mono' | '2amb' | '3amb' | 'casa' | 'lujo';
export type OperationType = 'venta' | 'alquiler' | 'temporario';
