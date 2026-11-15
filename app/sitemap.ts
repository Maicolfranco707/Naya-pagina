import type { MetadataRoute } from "next";
import { slugProducto } from "@/utils/catalogo";
import { obtenerProductos } from "@/utils/productos-servidor";

const SITIO = (process.env.NEXT_PUBLIC_SITE_URL || "https://naya-pagina.vercel.app").replace(/\/$/, "");

export const revalidate = 3600;

/** Mapa del sitio para Google: inicio, catálogo y cada producto. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await obtenerProductos();
  const ahora = new Date();
  return [
    { url: `${SITIO}/`, lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: `${SITIO}/productos`, lastModified: ahora, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITIO}/test-mantequillas`, lastModified: ahora, changeFrequency: "monthly", priority: 0.5 },
    ...productos.map((p) => ({
      url: `${SITIO}/producto/${slugProducto(p)}`,
      lastModified: ahora,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${SITIO}/terminos`, lastModified: ahora, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITIO}/privacidad`, lastModified: ahora, changeFrequency: "yearly", priority: 0.2 },
  ];
}
