"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RutinaQuiz from "@/components/home/RutinaQuiz";
import type { Producto } from "@/utils/productos";

// Página propia del test (se abre en una pestaña aparte, como en Fauno).
export default function TestMantequillasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    document.title = "¿Qué mantequilla eres? | NAYA";
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Producto[]) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);

  const agregar = (lista: Producto[]) => {
    try {
      const carrito = JSON.parse(localStorage.getItem("carrito_naya") ?? "[]") as Array<{ producto: Producto; cantidad: number }>;
      for (const p of lista) {
        const existe = carrito.find((i) => i.producto.id === p.id);
        if (existe) existe.cantidad += 1;
        else carrito.push({ producto: p, cantidad: 1 });
      }
      localStorage.setItem("carrito_naya", JSON.stringify(carrito));
      setAgregado(true);
    } catch (error) {
      console.error("No se pudo guardar en el carrito:", error);
    }
  };

  return (
    <div className="nq-shell">
      <header className="nq-shell__header">
        <Link href="/" className="nq-shell__logo" aria-label="NAYA, ir a la tienda">NAYA</Link>
        <Link href="/" className="nq-shell__back">Volver a la tienda</Link>
      </header>
      <RutinaQuiz
        abierto
        modo="pagina"
        productos={productos}
        imagen={(p) => p.imagen}
        onClose={() => {}}
        onAgregar={agregar}
        agregado={agregado}
      />
    </div>
  );
}
