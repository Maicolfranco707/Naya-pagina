"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import NayaFooter from "@/components/layout/NayaFooter";
import NayaWhatsAppButton from "@/components/layout/NayaWhatsAppButton";
import { leerCarrito } from "@/utils/catalogo";

/** Encabezado + pie de página para las páginas de la tienda fuera del inicio. */
export default function TiendaShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [unidades, setUnidades] = useState(0);

  useEffect(() => {
    const actualizar = () => setUnidades(leerCarrito().reduce((s, i) => s + (i.cantidad || 0), 0));
    actualizar();
    window.addEventListener("naya-carrito", actualizar);
    window.addEventListener("storage", actualizar);
    return () => {
      window.removeEventListener("naya-carrito", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, []);

  return (
    <div className="storefront">
      <Navbar cartCount={unidades} onOpenCart={() => router.push(unidades > 0 ? "/checkout" : "/productos")} />
      <main>{children}</main>
      <NayaFooter />
      <NayaWhatsAppButton />
    </div>
  );
}
