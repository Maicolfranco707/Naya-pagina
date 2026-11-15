"use client";

import { useEffect, useState } from "react";
import Estrellas from "@/components/shop/Estrellas";
import type { Resena } from "@/utils/resenas";

/** Opiniones aprobadas en el inicio. Si todavía no hay, la sección no aparece. */
export default function ResenasInicio() {
  const [resenas, setResenas] = useState<Resena[]>([]);

  useEffect(() => {
    let activo = true;
    fetch("/api/resenas")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Resena[]) => { if (activo) setResenas(Array.isArray(data) ? data : []); })
      .catch(() => {});
    return () => { activo = false; };
  }, []);

  if (resenas.length === 0) return null;

  return (
    <section className="rv-home" aria-labelledby="rv-home-title">
      <p className="rv-home__eyebrow">Opiniones reales</p>
      <h2 id="rv-home-title">Lo que dicen de NAYA</h2>
      <ul className="rv-home__list">
        {resenas.map((r) => (
          <li key={r.id}>
            <Estrellas valor={r.rating} tamano={15} />
            <p>“{r.comment}”</p>
            <span>{r.author_name}{r.city ? ` · ${r.city}` : ""}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
