import { createClient } from '@supabase/supabase-js';
import type { Property } from '../types';

const SUPABASE_URL = 'https://zhgxrjdcefanlgvfrgji.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ3hyamRjZWZhbmxndmZyZ2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDQ4NDUsImV4cCI6MjA4OTE4MDg0NX0.mHqkvSB2464qd0NBtY6aHw7Kruv2SrX6XF6kblZ3S2k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('featured', { ascending: false })
      .order('match_score', { ascending: false });

    if (error || !data?.length) return FALLBACK_PROPS;
    return data as Property[];
  } catch {
    return FALLBACK_PROPS;
  }
}

const FALLBACK_PROPS: Property[] = [
  {
    id: 1, price_usd: 185000, price_display: 'USD 185.000',
    address: 'Thames 1842, Palermo Hollywood', neighborhood: 'Palermo',
    type: '2amb', bedrooms: 2, area_m2: 58, badge: 'Nuevo', match_score: 94,
    description: 'Hermoso depto a estrenar en Palermo Hollywood. Piso 8 con vista abierta, balcón al frente, luminoso todo el día.',
    tags: ['2 amb', '58 m²', 'Balcón', 'Luminoso', 'A estrenar'],
    image_url: 'https://images.unsplash.com/photo-1600596542815-0c96b9b8b33c?w=800&q=80',
    gradient: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', likes: 23, featured: true,
  },
  {
    id: 2, price_usd: 245000, price_display: 'USD 245.000',
    address: 'Av. del Libertador 3200, Belgrano R', neighborhood: 'Belgrano',
    type: '3amb', bedrooms: 3, area_m2: 85, badge: 'Destacado', match_score: 87,
    description: 'Amplio 3 ambientes en Belgrano R con terraza propia y cochera cubierta.',
    tags: ['3 amb', '85 m²', 'Cochera', 'Terraza', 'SUM'],
    image_url: 'https://images.unsplash.com/photo-1600607687920-4e03d67d8438?w=800&q=80',
    gradient: 'linear-gradient(135deg,#2d132c,#801336,#c72c41)', likes: 45, featured: true,
  },
  {
    id: 3, price_usd: 92000, price_display: 'USD 92.000',
    address: 'Malabia 654, Villa Crespo', neighborhood: 'Villa Crespo',
    type: 'monoambiente', bedrooms: 1, area_m2: 32, badge: 'Oportunidad', match_score: 78,
    description: 'Monoambiente reciclado a nuevo en Villa Crespo. Ideal inversión o primera vivienda.',
    tags: ['Monoamb', '32 m²', 'Reciclado', 'A estrenar'],
    image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
    gradient: 'linear-gradient(135deg,#0d324d,#7f5a83,#a188a6)', likes: 12, featured: false,
  },
  {
    id: 4, price_usd: 320000, price_display: 'USD 320.000',
    address: 'Olazábal 4500, Núñez', neighborhood: 'Núñez',
    type: 'casa', bedrooms: 4, area_m2: 180, badge: 'Premium', match_score: 71,
    description: 'Espectacular casa en Núñez con jardín y pileta. 4 ambientes, cocina gourmet.',
    tags: ['4 amb', '180 m²', 'Jardín', 'Pileta', 'Quincho'],
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    gradient: 'linear-gradient(135deg,#1b262c,#0f4c75,#3282b8)', likes: 67, featured: true,
  },
  {
    id: 5, price_usd: 158000, price_display: 'USD 158.000',
    address: 'Avenida Quintana 580, Recoleta', neighborhood: 'Recoleta',
    type: '2amb', bedrooms: 2, area_m2: 64, badge: 'Popular', match_score: 91,
    description: '2 ambientes con vista panorámica en Recoleta. Piso 14 en edificio icónico.',
    tags: ['2 amb', '64 m²', 'Vista panorámica', 'Piso alto'],
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    gradient: 'linear-gradient(135deg,#2b2e4a,#903749,#e84545)', likes: 89, featured: true,
  },
];
