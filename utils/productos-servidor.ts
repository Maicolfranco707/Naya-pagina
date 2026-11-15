import { createSupabaseServerClient } from "@/utils/supabase/server";
import type { Producto } from "@/utils/productos";

/** Productos activos desde Supabase (para páginas que se arman en el servidor). */
export async function obtenerProductos(): Promise<Producto[]> {
  try {
    const { data, error } = await createSupabaseServerClient()
      .from("products")
      .select("id, category, name, description, details, price_cop, image_url")
      .eq("active", true)
      .order("id");
    if (error || !data) {
      if (error) console.error("No se pudieron cargar los productos:", error.message);
      return [];
    }
    return data.map((p) => ({
      id: Number(p.id),
      categoria: p.category,
      nombre: p.name,
      descripcion: p.description,
      detalles: p.details ?? undefined,
      precio: p.price_cop,
      imagen: p.image_url,
    }));
  } catch (error) {
    console.error("Supabase no está configurado:", error);
    return [];
  }
}
