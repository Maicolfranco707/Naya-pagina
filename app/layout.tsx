import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

// Textos: DM Sans (cálida y legible). Títulos: Fraunces (serif con carácter).
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "NAYA | Renovación profunda en tu piel",
  description: "Bienestar corporal y capilar desde la ancestralidad y lo natural",
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
      </body>
    </html>
  );
}