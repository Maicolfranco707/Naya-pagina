"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductoCard from "@/components/shop/ProductoCard";
import { agregarAlCarritoGuardado, CATEGORIAS_TIENDA, categoriaTienda, normalizar, type CategoriaTienda } from "@/utils/catalogo";
import type { Producto } from "@/utils/productos";

const SINONIMOS: Record<string, string> = { champu: "shampoo", shampu: "shampoo", pelo: "capilar", cabello: "capilar", cuerpo: "corporal", crema: "mantequilla", combo: "kit" };

function raiz(palabra: string) {
  let r = SINONIMOS[palabra] ?? palabra;
  if (r.length > 5 && r.endsWith("es")) r = r.slice(0, -2);
  else if (r.length > 3 && r.endsWith("s")) r = r.slice(0, -1);
  return SINONIMOS[r] ?? r;
}

export default function TodosLosProductos() {
  const router = useRouter();
  const params = useSearchParams();
  const catParam = params.get("cat") as CategoriaTienda | null;
  const q = params.get("q") ?? "";
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const categoria: CategoriaTienda | "Todos" = catParam && CATEGORIAS_TIENDA.includes(catParam) ? catParam : "Todos";

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Producto[]) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = useMemo(() => {
    const deCategoria = productos.filter((p) => categoria === "Todos" || categoriaTienda(p) === categoria);
    const palabras = normalizar(q).split(/\s+/).filter((w) => w.length > 1 && !["de", "la", "el", "para", "con"].includes(w)).map(raiz);
    if (palabras.length === 0) return deCategoria;
    const texto = (p: Producto) => normalizar([p.nombre, p.categoria, p.descripcion, p.detalles, categoriaTienda(p)].join(" "));
    const todas = deCategoria.filter((p) => palabras.every((w) => texto(p).includes(w)));
    return todas.length > 0 ? todas : deCategoria.filter((p) => palabras.some((w) => texto(p).includes(w)));
  }, [productos, categoria, q]);

  const irA = (cat: string) => router.push(cat === "Todos" ? "/productos" : `/productos?cat=${encodeURIComponent(cat)}`);

  return (
    <section className="naya-shop naya-shop--page">
      <div className="naya-shop__header">
        <h1 id="naya-shop-title">{categoria === "Todos" ? "Todos los productos" : categoria}</h1>
        <div className="naya-shop__tabs" role="tablist" aria-label="Filtrar productos">
          {(["Todos", ...CATEGORIAS_TIENDA] as const).map((cat) => (
            <button key={cat} type="button" role="tab" aria-selected={categoria === cat} onClick={() => irA(cat)} className={categoria === cat ? "naya-shop__tab naya-shop__tab--active" : "naya-shop__tab"}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {q && !cargando && (
        <div className="naya-shop__search" role="status" aria-live="polite">
          <span>{filtrados.length > 0 ? `${filtrados.length} ${filtrados.length === 1 ? "resultado" : "resultados"} para “${q}”` : `No encontramos productos para “${q}”.`}</span>
          <button type="button" onClick={() => irA(categoria)}>Quitar búsqueda</button>
        </div>
      )}

      {cargando ? (
        <p className="naya-shop__empty">Cargando productos...</p>
      ) : filtrados.length === 0 ? (
        <p className="naya-shop__empty">Prueba con otra palabra, por ejemplo: shampoo, romero o mantequilla.</p>
      ) : (
        <div className="naya-shop__grid">
          {filtrados.map((p) => <ProductoCard key={p.id} producto={p} onAgregar={(x) => agregarAlCarritoGuardado(x)} />)}
        </div>
      )}
    </section>
  );
}
