"use client";

import { useEffect, useState } from "react";
import { Check, EyeOff, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import Estrellas from "@/components/shop/Estrellas";

interface ResenaAdmin {
  id: number;
  product_id: number | null;
  author_name: string;
  city: string | null;
  rating: number;
  comment: string;
  photos?: string[] | null;
  verified_purchase?: boolean | null;
  approved: boolean;
  created_at: string;
  products: { name: string } | null;
}

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

export default function ReviewsPanel() {
  const [resenas, setResenas] = useState<ResenaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setCargando(true);
    const { data, error: errorCarga } = await createSupabaseBrowserClient()
      .from("product_reviews")
      .select("id, product_id, author_name, city, rating, comment, approved, created_at, photos, verified_purchase, products(name)")
      .order("approved", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(200);
    if (errorCarga) setError("No se pudieron cargar las reseñas.");
    setResenas((data ?? []) as unknown as ResenaAdmin[]);
    setCargando(false);
  };

  useEffect(() => { void cargar(); }, []);

  const aprobar = async (id: number, approved: boolean) => {
    setError("");
    const { error: errorGuardar } = await createSupabaseBrowserClient().from("product_reviews").update({ approved }).eq("id", id);
    if (errorGuardar) setError("No se pudo cambiar la reseña.");
    else setResenas((actual) => actual.map((r) => (r.id === id ? { ...r, approved } : r)));
  };

  const borrar = async (id: number) => {
    if (!window.confirm("¿Borrar esta reseña? No se puede deshacer.")) return;
    setError("");
    const { error: errorBorrar } = await createSupabaseBrowserClient().from("product_reviews").delete().eq("id", id);
    if (errorBorrar) setError("No se pudo borrar la reseña.");
    else setResenas((actual) => actual.filter((r) => r.id !== id));
  };

  const pendientes = resenas.filter((r) => !r.approved).length;

  return (
    <section className="mt-5 space-y-4">
      <p className="text-sm text-stone-600">
        Los clientes dejan su opinión en la página de cada producto. Solo se muestran las que apruebes.
        {pendientes > 0 && <strong className="ml-1 text-amber-700">{pendientes} por revisar.</strong>}
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {cargando ? (
        <p className="py-10 text-center text-sm text-stone-500">Cargando reseñas...</p>
      ) : resenas.length === 0 ? (
        <p className="border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">Todavía no hay reseñas.</p>
      ) : (
        <ul className="divide-y divide-stone-200 border border-stone-300 bg-white">
          {resenas.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Estrellas valor={r.rating} tamano={14} />
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {r.approved ? "Publicada" : "Por revisar"}
                  </span>
                  <span className="text-stone-500">{r.products?.name?.trim() || "Tienda en general"}</span>
                </div>
                <p className="mt-2 text-sm text-stone-800">“{r.comment}”</p>
                {!!r.photos?.length && (
                  <div className="mt-2 flex gap-2">
                    {r.photos.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Foto de la reseña" className="h-16 w-16 rounded object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                {r.verified_purchase && <p className="mt-1 text-xs font-semibold text-emerald-700">Compra verificada</p>}
                <p className="mt-1 text-xs text-stone-500">{r.author_name}{r.city ? ` · ${r.city}` : ""} · {fecha(r.created_at)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {r.approved ? (
                  <button type="button" onClick={() => void aprobar(r.id, false)} className="inline-flex items-center gap-1 border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50">
                    <EyeOff size={14} /> Ocultar
                  </button>
                ) : (
                  <button type="button" onClick={() => void aprobar(r.id, true)} className="inline-flex items-center gap-1 bg-emerald-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800">
                    <Check size={14} /> Aprobar
                  </button>
                )}
                <button type="button" onClick={() => void borrar(r.id)} className="inline-flex items-center gap-1 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                  <Trash2 size={14} /> Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
