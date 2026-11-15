"use client";

import { type FormEvent, useState } from "react";
import { Star } from "lucide-react";
import Estrellas from "@/components/shop/Estrellas";
import { promedio, type Resena } from "@/utils/resenas";

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-CO", { month: "long", year: "numeric" });

export default function ResenasProducto({ productoId, resenas }: { productoId: number; resenas: Resena[] }) {
  const [abierto, setAbierto] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [comentario, setComentario] = useState("");
  const [sitio, setSitio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (calificacion < 1) {
      setError("Elige de 1 a 5 estrellas.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const response = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoId, nombre, ciudad, comentario, calificacion, sitio }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "No pudimos guardar tu opinión.");
      setEnviado(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos guardar tu opinión.");
    } finally {
      setEnviando(false);
    }
  };

  const prom = promedio(resenas);

  return (
    <section className="rv" aria-labelledby="rv-title">
      <div className="rv__head">
        <div>
          <h2 id="rv-title">Opiniones</h2>
          {resenas.length > 0 ? (
            <p className="rv__summary"><Estrellas valor={prom} /> <strong>{prom.toFixed(1)}</strong> · {resenas.length} {resenas.length === 1 ? "opinión" : "opiniones"}</p>
          ) : (
            <p className="rv__summary">Todavía no hay opiniones de este producto. ¿Ya lo probaste?</p>
          )}
        </div>
        {!abierto && !enviado && (
          <button type="button" className="rv__write" onClick={() => setAbierto(true)}>Escribir una opinión</button>
        )}
      </div>

      {enviado ? (
        <p className="rv__thanks">¡Gracias por tu opinión! La publicaremos apenas la revisemos.</p>
      ) : abierto && (
        <form className="rv__form" onSubmit={enviar}>
          <div className="rv__rate" role="radiogroup" aria-label="Calificación">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={calificacion === n}
                aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                onClick={() => setCalificacion(n)}
              >
                <Star size={26} className={n <= calificacion ? "rv-stars__on" : "rv-stars__off"} />
              </button>
            ))}
          </div>
          <div className="rv__row">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" maxLength={60} required disabled={enviando} aria-label="Tu nombre" />
            <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ciudad (opcional)" maxLength={60} disabled={enviando} aria-label="Ciudad" />
          </div>
          <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="¿Cómo te fue con el producto?" rows={4} minLength={5} maxLength={800} required disabled={enviando} aria-label="Tu opinión" />
          <input className="rv__trap" tabIndex={-1} autoComplete="off" value={sitio} onChange={(e) => setSitio(e.target.value)} aria-hidden="true" />
          {error && <p className="rv__error" role="alert">{error}</p>}
          <div className="rv__actions">
            <button type="submit" className="rv__send" disabled={enviando}>{enviando ? "Enviando..." : "Enviar opinión"}</button>
            <button type="button" className="rv__cancel" onClick={() => setAbierto(false)} disabled={enviando}>Cancelar</button>
          </div>
        </form>
      )}

      {resenas.length > 0 && (
        <ul className="rv__list">
          {resenas.map((r) => (
            <li key={r.id}>
              <Estrellas valor={r.rating} tamano={14} />
              <p className="rv__comment">{r.comment}</p>
              <p className="rv__author">{r.author_name}{r.city ? ` · ${r.city}` : ""} · {fecha(r.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
