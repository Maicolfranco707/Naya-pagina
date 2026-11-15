import type { Metadata } from "next";
import { Suspense } from "react";
import TiendaShell from "@/components/shop/TiendaShell";
import TodosLosProductos from "@/components/shop/TodosLosProductos";

export const metadata: Metadata = { title: "Todos los productos | NAYA", description: "Shampoos, acondicionadores, ampolletas, mantequillas corporales y kits NAYA." };

export default function ProductosPage() {
  return (
    <TiendaShell>
      <Suspense fallback={<p className="naya-shop__empty">Cargando productos...</p>}>
        <TodosLosProductos />
      </Suspense>
    </TiendaShell>
  );
}
