import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/layout/Analytics";

// Textos: DM Sans (cálida y legible). Títulos: Fraunces (serif con carácter).
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const SITIO = (process.env.NEXT_PUBLIC_SITE_URL || "https://naya-pagina.vercel.app").replace(/\/$/, "");
const DESCRIPCION = "Cosmética natural para tu cabello y tu piel: shampoos de romero y cayena, ampolletas y mantequillas corporales. Hecho en Medellín, envíos a toda Colombia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: "NAYA | Renovación profunda en tu piel",
  description: DESCRIPCION,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "NAYA Cosmética Natural",
    title: "NAYA | Cosmética natural para tu cabello y tu piel",
    description: DESCRIPCION,
    images: [{ url: "/og-naya.jpg", width: 1200, height: 630, alt: "NAYA Cosmética Natural" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NAYA | Cosmética natural para tu cabello y tu piel",
    description: DESCRIPCION,
    images: ["/og-naya.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${fraunces.variable} font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}