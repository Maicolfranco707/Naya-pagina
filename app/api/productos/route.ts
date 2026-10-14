import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, category, name, description, details, price_cop, image_url")
      .eq("active", true)
      .order("id");

    if (error) {
      console.error("Supabase products query failed:", error.message);
      return NextResponse.json({ error: "No se pudo cargar el catálogo." }, { status: 502 });
    }

    return NextResponse.json(data.map((product) => ({
      id: Number(product.id),
      categoria: product.category,
      nombre: product.name,
      descripcion: product.description,
      detalles: product.details,
      precio: product.price_cop,
      imagen: product.image_url,
    })));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase no está configurado.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}