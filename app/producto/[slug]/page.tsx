import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TiendaShell from "@/components/shop/TiendaShell";
import ProductoDetalle from "@/components/shop/ProductoDetalle";
import { obtenerProductos } from "@/utils/productos-servidor";
import { relacionados, slugProducto } from "@/utils/catalogo";

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
  return { title: `${nombre} | NAYA`, description: producto.descripcion };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { productos, producto } = await buscar(slug);
  if (!producto) notFound();
  return (
    <TiendaShell>
      <ProductoDetalle producto={producto} relacionados={relacionados(producto, productos)} />
    </TiendaShell>
  );
}
