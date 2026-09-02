import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: "--font-manrope",
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
      {/* Se cambia 'class' por 'className' */}
      <body className={`${manrope.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}