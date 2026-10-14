import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Nunito_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
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
      <body className={`${manrope.variable} ${nunitoSans.variable} ${cormorantGaramond.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}