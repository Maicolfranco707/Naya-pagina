"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";

interface Cupon {
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_subtotal_cop: number;
  max_uses: number | null;
  one_per_email: boolean;
  active: boolean;
  ends_at: string | null;
}

const VACIO = {
  code: "",
  description: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: "10",
  min_subtotal_cop: "0",
  max_uses: "",
  one_per_email: true,
  ends_at: "",
};

const pesos = (valor: number) => `$${valor.toLocaleString("es-CO")}`;

export default function CouponsPanel() {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [usos, setUsos] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(true);
  const [formulario, setFormulario] = useState<typeof VACIO | null>(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    const supabase = createSupabaseBrowserClient();
    const [{ data, error: errorCupones }, { data: pedidos }] = await Promise.all([
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("coupon_code, payment_status, payment_provider, order_status").not("coupon_code", "is", null),
    ]);
    if (errorCupones) setError(errorCupones.message);
    setCupones((data ?? []) as Cupon[]);
    const conteo: Record<string, number> = {};
    for (const p of pedidos ?? []) {
      const real = p.payment_status === "approved" || (p.payment_provider === "whatsapp" && p.order_status !== "cancelled");
      if (real && p.coupon_code) conteo[p.coupon_code] = (conteo[p.coupon_code] ?? 0) + 1;
    }
    setUsos(conteo);
    setCargando(false);
  };

  useEffect(() => {
    // Carga inicial de datos desde Supabase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, []);

  const cambiarActivo = async (cupon: Cupon) => {
    const { error: e } = await createSupabaseBrowserClient().from("coupons").update({ active: !cupon.active }).eq("code", cupon.code);
    if (e) setError(e.message); else void cargar();
  };

  const guardar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formulario) return;
    const code = formulario.code.trim().toUpperCase();
    const valor = Number(formulario.discount_value);
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return setError("El código debe tener de 3 a 30 letras, números, - o _ (sin espacios).");
    if (!Number.isInteger(valor) || valor <= 0 || (formulario.discount_type === "percent" && valor > 100)) return setError("Revisa el valor del descuento.");
    setGuardando(true);
    setError("");
    const { error: e } = await createSupabaseBrowserClient().from("coupons").insert({
      code,
      description: formulario.description.trim() || null,
      discount_type: formulario.discount_type,
      discount_value: valor,
      min_subtotal_cop: Number(formulario.min_subtotal_cop) || 0,
      max_uses: formulario.max_uses ? Number(formulario.max_uses) : null,
      one_per_email: formulario.one_per_email,
      ends_at: formulario.ends_at ? new Date(`${formulario.ends_at}T23:59:59-05:00`).toISOString() : null,
    });
    setGuardando(false);
    if (e) return setError(e.code === "23505" ? "Ya existe un cupón con ese código." : e.message);
    setFormulario(null);
    void cargar();
  };

  const campo = "mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-900";

  return (
    <section className="mt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500">{cupones.length} cupones</p>
        <button type="button" onClick={() => { setError(""); setFormulario({ ...VACIO }); }} className="inline-flex items-center gap-2 bg-emerald-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900">
          <Plus size={16} /> Nuevo cupón
        </button>
      </div>

      {error && <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}

      {formulario && (
        <form onSubmit={guardar} className="mb-6 grid gap-4 border border-stone-200 bg-white p-5 sm:grid-cols-2">
          <div className="flex items-center justify-between sm:col-span-2">
            <h3 className="font-semibold text-stone-900">Nuevo cupón</h3>
            <button type="button" onClick={() => setFormulario(null)} aria-label="Cerrar"><X size={18} /></button>
          </div>
          <label className="text-sm text-stone-600">Código
            <input className={`${campo} uppercase`} value={formulario.code} onChange={(e) => setFormulario({ ...formulario, code: e.target.value.toUpperCase() })} placeholder="VERANO15" required />
          </label>
          <label className="text-sm text-stone-600">Descripción (la ve el cliente)
            <input className={campo} value={formulario.description} onChange={(e) => setFormulario({ ...formulario, description: e.target.value })} placeholder="15% en toda la tienda" />
          </label>
          <label className="text-sm text-stone-600">Tipo
            <select className={campo} value={formulario.discount_type} onChange={(e) => setFormulario({ ...formulario, discount_type: e.target.value as "percent" | "fixed" })}>
              <option value="percent">Porcentaje (%)</option>
              <option value="fixed">Valor fijo ($)</option>
            </select>
          </label>
          <label className="text-sm text-stone-600">{formulario.discount_type === "percent" ? "Porcentaje" : "Valor en pesos"}
            <input className={campo} type="number" min={1} value={formulario.discount_value} onChange={(e) => setFormulario({ ...formulario, discount_value: e.target.value })} required />
          </label>
          <label className="text-sm text-stone-600">Compra mínima (pesos, 0 = sin mínimo)
            <input className={campo} type="number" min={0} value={formulario.min_subtotal_cop} onChange={(e) => setFormulario({ ...formulario, min_subtotal_cop: e.target.value })} />
          </label>
          <label className="text-sm text-stone-600">Usos máximos en total (vacío = ilimitado)
            <input className={campo} type="number" min={1} value={formulario.max_uses} onChange={(e) => setFormulario({ ...formulario, max_uses: e.target.value })} />
          </label>
          <label className="text-sm text-stone-600">Vence el (opcional)
            <input className={campo} type="date" value={formulario.ends_at} onChange={(e) => setFormulario({ ...formulario, ends_at: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-stone-700">
            <input type="checkbox" checked={formulario.one_per_email} onChange={(e) => setFormulario({ ...formulario, one_per_email: e.target.checked })} />
            Un solo uso por correo
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={guardando} className="bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">
              {guardando ? "Guardando..." : "Crear cupón"}
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <p className="py-16 text-center text-sm text-stone-500">Cargando cupones...</p>
      ) : (
        <div className="divide-y divide-stone-200 border border-stone-200 bg-white">
          {cupones.map((cupon) => (
            <article key={cupon.code} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 font-semibold text-stone-900"><Tag size={15} /> {cupon.code}
                  <span className={`px-2 py-0.5 text-xs font-medium ${cupon.active ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>{cupon.active ? "Activo" : "Inactivo"}</span>
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {cupon.discount_type === "percent" ? `${cupon.discount_value}%` : pesos(cupon.discount_value)} de descuento
                  {cupon.min_subtotal_cop > 0 && ` · compras desde ${pesos(cupon.min_subtotal_cop)}`}
                  {cupon.one_per_email && " · 1 uso por correo"}
                  {cupon.ends_at && ` · vence ${new Date(cupon.ends_at).toLocaleDateString("es-CO")}`}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">Usado {usos[cupon.code] ?? 0}{cupon.max_uses ? ` de ${cupon.max_uses}` : ""} {(usos[cupon.code] ?? 0) === 1 ? "vez" : "veces"}</p>
              </div>
              <button type="button" onClick={() => cambiarActivo(cupon)} className="border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
                {cupon.active ? "Desactivar" : "Activar"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
