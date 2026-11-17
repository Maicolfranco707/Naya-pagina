import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TiendaShell from "@/components/shop/TiendaShell";
import ProductoDetalle from "@/components/shop/ProductoDetalle";
import { obtenerProductos } from "@/utils/productos-servidor";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import type { Resena } from "@/utils/resenas";
import { imagenDe, relacionados, slugProducto } from "@/utils/catalogo";

export const dynamic = "force-dynamic";

async function buscar(slug: string) {
  const productos = await obtenerProductos();
  const producto = productos.find((p) => slugProducto(p) === slug);
  return { productos, producto };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { producto } = await buscar(slug);
  if (!producto) return { title: "Producto no encontrado | NAYA" };
  const nombre = producto.nombre.replace(/\s+/g, " ").trim();
  const imagen = imagenDe(producto);
  return {
    title: `${nombre} | NAYA`,
    description: producto.descripcion,
    alternates: { canonical: `/producto/${slug}` },
    openGraph: {
      type: "website",
      title: `${nombre} · $${producto.precio.toLocaleString("es-CO")} | NAYA`,
      description: producto.descripcion,
      url: `/producto/${slug}`,
      images: [{ url: imagen, alt: nombre }],
    },
    twitter: { card: "summary_large_image", title: `${nombre} | NAYA`, description: producto.descripcion, images: [imagen] },
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { productos, producto } = await buscar(slug);
  if (!producto) notFound();

  let resenas: Resena[] = [];
  try {
    const { data } = await createSupabaseServerClient()
      .from("product_reviews")
      .select("id, product_id, author_name, city, rating, comment, created_at, verified_purchase")
      .eq("product_id", producto.id)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(50);
    resenas = (data ?? []) as Resena[];
  } catch (error) {
    console.error("No se pudieron leer las reseñas del producto:", error);
  }

  return (
    <TiendaShell>
      <ProductoDetalle producto={producto} relacionados={relacionados(producto, productos)} resenas={resenas} />
    </TiendaShell>
  );
}
