"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";
import { categoriaTienda, imagenDe, urlProducto } from "@/utils/catalogo";
import type { Producto } from "@/utils/productos";

export default function ProductoCard({ producto, onAgregar }: { producto: Producto; onAgregar: (p: Producto) => void }) {
  const [agregado, setAgregado] = useState(false);
  const url = urlProducto(producto);
  return (
    <article className="naya-card product-card--hair">
      <Link href={url} className="naya-card__media" aria-label={`Ver ${producto.nombre}`}>
        <Image src={imagenDe(producto)} alt={producto.nombre} fill sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw" className="object-cover" />
      </Link>
      <div className="naya-card__info">
        <p className="naya-card__line">{categoriaTienda(producto)}</p>
        <h3><Link href={url}>{producto.nombre.replace(/\s+/g, " ").trim()}</Link></h3>
        <p className="naya-card__price">${producto.precio.toLocaleString("es-CO")}</p>
      </div>
      <button
        type="button"
        className="naya-card__add"
        onClick={() => {
          onAgregar(producto);
          setAgregado(true);
          window.setTimeout(() => setAgregado(false), 1800);
        }}
      >
        {agregado ? <><Check size={15} aria-hidden="true" /> Agregado</> : "Agregar al carrito"}
      </button>
    </article>
  );
}
