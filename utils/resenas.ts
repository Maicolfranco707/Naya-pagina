export interface Resena {
  id: number;
  product_id: number | null;
  author_name: string;
  city: string | null;
  rating: number;
  comment: string;
  created_at: string;
  verified_purchase?: boolean;
  photos?: string[];
}

export const promedio = (resenas: Resena[]) =>
  resenas.length ? resenas.reduce((s, r) => s + r.rating, 0) / resenas.length : 0;
