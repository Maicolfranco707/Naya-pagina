"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Camera, Star, X } from "lucide-react";
import Estrellas from "@/components/shop/Estrellas";
import { promedio, type Resena } from "@/utils/resenas";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";

type Orden = "recientes" | "mayor" | "menor";

// Achica la foto en el celular antes de subirla (máx. 1600 px, JPG), para que suba rápido.
async function achicarFoto(archivo: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(archivo);
    const escala = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.82));
    return blob ? new File([blob], "foto.jpg", { type: "image/jpeg" }) : archivo;
  } catch {
    return archivo;
  }
}

function haceCuanto(iso: string) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias < 1) return "hoy";
  if (dias === 1) return "hace 1 día";
  if (dias < 30) return `hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return meses === 1 ? "hace 1 mes" : `hace ${meses} meses`;
  const anios = Math.floor(meses / 12);
  return anios === 1 ? "hace 1 año" : `hace ${anios} años`;
}

export default function ResenasProducto({ productoId, resenas }: { productoId: number; resenas: Resena[] }) {
  const ruta = usePathname();
  const [conSesion, setConSesion] = useState<boolean | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [orden, setOrden] = useState<Orden>("recientes");
  const [filtro, setFiltro] = useState(0);
  const [fotos, setFotos] = useState<File[]>([]);
  const [vistaPrevia, setVistaPrevia] = useState<string[]>([]);
  const [fotoGrande, setFotoGrande] = useState<string | null>(null);

  useEffect(() => {
    const urls = fotos.map((f) => URL.createObjectURL(f));
    setVistaPrevia(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [fotos]);

  const elegirFotos = async (lista: FileList | null) => {
    if (!lista) return;
    const nuevas = Array.from(lista).filter((f) => f.type.startsWith("image/")).slice(0, 3 - fotos.length);
    const achicadas = await Promise.all(nuevas.map(achicarFoto));
    setFotos((actuales) => [...actuales, ...achicadas].slice(0, 3));
  };

  useEffect(() => {
    createSupabaseBrowserClient().auth.getSession()
      .then(({ data }) => setConSesion(Boolean(data.session)))
      .catch(() => setConSesion(false));
  }, []);

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (calificacion < 1) {
      setError("Elige de 1 a 5 estrellas.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const { data } = await createSupabaseBrowserClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setConSesion(false);
        throw new Error("Tu sesión se cerró. Inicia sesión otra vez para escribir la reseña.");
      }
      const datos = new FormData();
      datos.append("productoId", String(productoId));
      datos.append("comentario", comentario);
      datos.append("calificacion", String(calificacion));
      fotos.forEach((f) => datos.append("fotos", f));
      const response = await fetch("/api/resenas", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: datos,
      });
      const respuesta = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(respuesta.error || "No pudimos guardar tu reseña.");
      setEnviado(true);
      setAbierto(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos guardar tu reseña.");
    } finally {
      setEnviando(false);
    }
  };

  const prom = promedio(resenas);
  const todasLasFotos = resenas.flatMap((r) => r.photos ?? []).slice(0, 6);
  const conteo = [5, 4, 3, 2, 1].map((n) => ({ n, total: resenas.filter((r) => r.rating === n).length }));
  const lista = useMemo(() => {
    const filtradas = filtro ? resenas.filter((r) => r.rating === filtro) : resenas;
    return [...filtradas].sort((a, b) =>
      orden === "mayor" ? b.rating - a.rating : orden === "menor" ? a.rating - b.rating : +new Date(b.created_at) - +new Date(a.created_at));
  }, [resenas, orden, filtro]);

  return (
    <section className="rv" aria-labelledby="rv-title">
      <h2 id="rv-title">Reseñas de clientes</h2>

      <div className="rv__top">
        <div className="rv__score">
          <p><strong>{resenas.length ? prom.toFixed(1).replace(".0", "") : "0"}</strong><span>/ 5</span></p>
          <Estrellas valor={prom} tamano={18} />
          <small>{resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}</small>
        </div>
        <ul className="rv__bars" aria-label="Reseñas por estrellas">
          {conteo.map(({ n, total }) => (
            <li key={n}>
              <span>{n} <Star size={11} className="rv-stars__on" aria-hidden="true" /></span>
              <span className="rv__bar"><span style={{ width: `${resenas.length ? (total / resenas.length) * 100 : 0}%` }} /></span>
              <span>{resenas.length ? Math.round((total / resenas.length) * 100) : 0}%</span>
            </li>
          ))}
        </ul>
        {todasLasFotos.length > 0 && (
          <div className="rv__gallery">
            {todasLasFotos.map((url) => (
              <button key={url} type="button" onClick={() => setFotoGrande(url)} aria-label="Ver foto de cliente">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rv__cta">
        {enviado ? (
          <p className="rv__thanks">¡Gracias por tu reseña! La publicaremos apenas la revisemos.</p>
        ) : conSesion === false ? (
          <p className="rv__login">
            Para escribir una reseña <Link href={`/cuenta/ingresar?volver=${encodeURIComponent(ruta)}`}>inicia sesión o crea tu cuenta</Link>.
          </p>
        ) : !abierto && (
          <button type="button" className="rv__write" onClick={() => setAbierto(true)} disabled={conSesion === null}>Escribir una reseña</button>
        )}
      </div>

      {abierto && !enviado && (
        <form className="rv__form" onSubmit={enviar}>
          <p className="rv__label">Tu calificación</p>
          <div className="rv__rate" role="radiogroup" aria-label="Calificación">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={calificacion === n} aria-label={`${n} estrella${n > 1 ? "s" : ""}`} onClick={() => setCalificacion(n)}>
                <Star size={28} className={n <= calificacion ? "rv-stars__on" : "rv-stars__off"} />
              </button>
            ))}
          </div>
          <label className="rv__label" htmlFor="rv-comentario">Tu reseña</label>
          <textarea id="rv-comentario" value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="¿Cómo te fue con el producto?" rows={4} minLength={5} maxLength={800} required disabled={enviando} />
          <p className="rv__label">Fotos <small>(opcional, hasta 3)</small></p>
          <div className="rv__pics">
            {vistaPrevia.map((url, i) => (
              <span key={url} className="rv__pic">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" />
                <button type="button" onClick={() => setFotos((a) => a.filter((_, j) => j !== i))} aria-label="Quitar foto"><X size={14} /></button>
              </span>
            ))}
            {fotos.length < 3 && (
              <label className="rv__addpic">
                <Camera size={20} aria-hidden="true" />
                <span>Agregar</span>
                <input type="file" accept="image/*" multiple onChange={(e) => { void elegirFotos(e.target.files); e.target.value = ""; }} disabled={enviando} />
              </label>
            )}
          </div>
          {error && <p className="rv__error" role="alert">{error}</p>}
          <div className="rv__actions">
            <button type="submit" className="rv__send" disabled={enviando}>{enviando ? "Enviando..." : "Publicar reseña"}</button>
            <button type="button" className="rv__cancel" onClick={() => setAbierto(false)} disabled={enviando}>Cancelar</button>
          </div>
        </form>
      )}

      {resenas.length > 0 && (
        <>
          <div className="rv__tools">
            <h3>Reseñas <span>{resenas.length}</span></h3>
            <div>
              <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} aria-label="Ordenar reseñas">
                <option value="recientes">Más recientes</option>
                <option value="mayor">Mayor calificación</option>
                <option value="menor">Menor calificación</option>
              </select>
              <select value={filtro} onChange={(e) => setFiltro(Number(e.target.value))} aria-label="Filtrar por estrellas">
                <option value={0}>Todas las calificaciones</option>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} {n === 1 ? "estrella" : "estrellas"}</option>)}
              </select>
            </div>
          </div>
          <ul className="rv__list">
            {lista.map((r) => (
              <li key={r.id}>
                <div className="rv__item-top">
                  <Estrellas valor={r.rating} tamano={15} />
                  <span>{haceCuanto(r.created_at)}</span>
                </div>
                <p className="rv__author">
                  {r.author_name}
                  {r.verified_purchase && <span className="rv__verified"><BadgeCheck size={14} aria-hidden="true" /> Compra verificada</span>}
                </p>
                <p className="rv__comment">{r.comment}</p>
                {!!r.photos?.length && (
                  <div className="rv__thumbs">
                    {r.photos.map((url) => (
                      <button key={url} type="button" onClick={() => setFotoGrande(url)} aria-label="Ver foto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
            {lista.length === 0 && <li className="rv__none">No hay reseñas con esa calificación.</li>}
          </ul>
        </>
      )}
      {fotoGrande && (
        <div className="rv__lightbox" role="dialog" aria-label="Foto de cliente" onClick={() => setFotoGrande(null)}>
          <button type="button" aria-label="Cerrar" onClick={() => setFotoGrande(null)}><X size={22} /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoGrande} alt="Foto de cliente" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
