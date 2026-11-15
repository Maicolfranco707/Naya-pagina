import type { MetadataRoute } from "next";

const SITIO = (process.env.NEXT_PUBLIC_SITE_URL || "https://naya-pagina.vercel.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/checkout", "/cuenta", "/pago"] }],
    sitemap: `${SITIO}/sitemap.xml`,
  };
}
