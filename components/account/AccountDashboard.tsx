"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import { paginaRastreo } from "@/utils/transportadoras";
import CambiarContrasena from "@/components/account/CambiarContrasena";
import {
  COLUMNAS_PERFIL,
  DEPARTAMENTOS,
  ESTADO_PAGO,
  ESTADO_PEDIDO,
  PERFIL_VACIO,
  formatoPesos,
  numeroPedido,
  type PerfilCliente,
} from "@/utils/cuenta-cliente";

interface PedidoCliente {
  id: string;
  reference: string;
  created_at: string;
  total_cop: number;
  order_status: string;
  payment_status: string;
  payment_provider: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  order_items: Array<{ product_name: string; quantity: number }>;
}

interface AccountDashboardProps {
  user: User;
  onLogout: () => void;
}

const UNA_HORA = 60 * 60 * 1000;

// Un pago con Wompi que nunca se completó (el cliente cerró el checkout) no es un pedido real.
function esPedidoVisible(pedido: PedidoCliente) {
  if (pedido.payment_provider !== "wompi" || pedido.payment_status === "approved") return true;
  return Date.now() - new Date(pedido.created_at).getTime() < UNA_HORA;
}

function formatoFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(fecha));
}

export default function AccountDashboard({ user, onLogout }: AccountDashboardProps) {
  const [pedidos, setPedidos] = useState<PedidoCliente[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [errorPedidos, setErrorPedidos] = useState("");
  const [perfil, setPerfil] = useState<PerfilCliente>(PERFIL_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [mensajePerfil, setMensajePerfil] = useState("");
  const [errorPerfil, setErrorPerfil] = useState("");

  const nombreCliente = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";

  useEffect(() => {
    let activo = true;
    const supabase = createSupabaseBrowserClient();

    const cargar = async () => {
      const [pedidosResult, perfilResult] = await Promise.all([
        supabase
          .from("orders")
          .select("id, reference, created_at, total_cop, order_status, payment_status, payment_provider, tracking_carrier, tracking_number, order_items(product_name, quantity)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase.from("customer_profiles").select(COLUMNAS_PERFIL).eq("user_id", user.id).maybeSingle(),
      ]);
      if (!activo) return;

      if (pedidosResult.error) {
        console.error("No se pudieron cargar los pedidos del cliente:", pedidosResult.error.message);
        setErrorPedidos("No pudimos cargar tus pedidos. Intenta de nuevo más tarde.");
      } else {
        setPedidos(((pedidosResult.data ?? []) as PedidoCliente[]).filter(esPedidoVisible));
      }
      setCargandoPedidos(false);

      if (perfilResult.error) {
        console.error("No se pudo cargar el perfil del cliente:", perfilResult.error.message);
      } else if (perfilResult.data) {
        setPerfil({ ...PERFIL_VACIO, ...(perfilResult.data as PerfilCliente) });
      } else {
        const [nombre = "", ...apellidos] = nombreCliente.trim().split(/\s+/);
        const telefono = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "";
        setPerfil({ ...PERFIL_VACIO, first_name: nombre, last_name: apellidos.join(" "), phone: telefono });
      }
    };

    void cargar();
    return () => {
      activo = false;
    };
  }, [user.id, user.user_metadata, nombreCliente]);

  const cambiarCampo = (campo: keyof PerfilCliente, valor: string) => {
    setPerfil((actual) => ({ ...actual, [campo]: valor }));
    setMensajePerfil("");
  };

  const guardarPerfil = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardando(true);
    setMensajePerfil("");
    setErrorPerfil("");
    try {
      const limpio = Object.fromEntries(
        Object.entries(perfil).map(([clave, valor]) => [clave, typeof valor === "string" ? valor.trim() || null : valor])
      );
      const { error } = await createSupabaseBrowserClient()
        .from("customer_profiles")
        .upsert({ ...limpio, user_id: user.id, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      setMensajePerfil("Guardamos tus datos. Los usaremos para llenar tu próximo pedido.");
    } catch (error) {
      console.error("No se pudo guardar el perfil del cliente:", error);
      setErrorPerfil("No pudimos guardar tus datos. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <h1 id="account-title">Mi cuenta</h1>
      <p className="account-subtitle">
        Hola{nombreCliente ? `, ${nombreCliente}` : ""}. Has iniciado sesión con <strong>{user.email}</strong>
      </p>

      <section className="account-section" aria-labelledby="mis-pedidos">
        <h2 id="mis-pedidos" className="account-section__title">Mis pedidos</h2>
        {cargandoPedidos ? (
          <p className="account-section__empty" role="status">Cargando tus pedidos...</p>
        ) : errorPedidos ? (
          <p className="account-message account-message--error" role="alert">{errorPedidos}</p>
        ) : pedidos.length === 0 ? (
          <div className="account-section__empty">
            <p>Aún no tienes pedidos. Las compras que hagas con tu sesión iniciada aparecerán aquí.</p>
            <Link href="/#catalogo" className="secondary-action account-section__cta">Ver productos</Link>
          </div>
        ) : (
          <ul className="account-orders">
            {pedidos.map((pedido) => {
              const pagado = pedido.payment_status === "approved";
              const cancelado = pedido.order_status === "cancelled";
              return (
                <li key={pedido.id} className="account-order">
                  <div className="account-order__header">
                    <div>
                      <p className="account-order__number">Pedido {numeroPedido(pedido.reference)}</p>
                      <p className="account-order__date">{formatoFecha(pedido.created_at)}</p>
                    </div>
                    <p className="account-order__total">{formatoPesos(pedido.total_cop)}</p>
                  </div>
                  <p className="account-order__items">
                    {pedido.order_items.map((item) => `${item.product_name} × ${item.quantity}`).join(" · ")}
                  </p>
                  <div className="account-order__badges">
                    <span className={`account-badge ${cancelado ? "account-badge--muted" : "account-badge--status"}`}>
                      {ESTADO_PEDIDO[pedido.order_status] ?? pedido.order_status}
                    </span>
                    {pedido.payment_provider === "whatsapp" && !pagado ? (
                      <span className="account-badge account-badge--muted">Pago por WhatsApp</span>
                    ) : (
                      <span className={`account-badge ${pagado ? "account-badge--paid" : "account-badge--muted"}`}>
                        {ESTADO_PAGO[pedido.payment_status] ?? pedido.payment_status}
                      </span>
                    )}
                  </div>
                  {pedido.tracking_number && (
                    <p className="account-order__tracking">
                      Guía {pedido.tracking_carrier && pedido.tracking_carrier !== "Otra" ? `${pedido.tracking_carrier} ` : ""}<strong>{pedido.tracking_number}</strong>
                      {paginaRastreo(pedido.tracking_carrier) && (
                        <> · <a href={paginaRastreo(pedido.tracking_carrier)} target="_blank" rel="noreferrer">Rastrear envío</a></>
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="account-section" aria-labelledby="mis-datos">
        <h2 id="mis-datos" className="account-section__title">Mis datos de envío</h2>
        <p className="account-section__hint">Los usamos para llenar automáticamente tu próximo pedido.</p>
        <form onSubmit={guardarPerfil} className="account-form account-profile-form">
          <div className="account-profile-grid">
            <label>
              Nombre
              <input className="account-field" autoComplete="given-name" value={perfil.first_name ?? ""} onChange={(e) => cambiarCampo("first_name", e.target.value)} />
            </label>
            <label>
              Apellidos
              <input className="account-field" autoComplete="family-name" value={perfil.last_name ?? ""} onChange={(e) => cambiarCampo("last_name", e.target.value)} />
            </label>
            <label>
              Cédula
              <input className="account-field" inputMode="numeric" value={perfil.identification ?? ""} onChange={(e) => cambiarCampo("identification", e.target.value)} />
            </label>
            <label>
              Teléfono
              <input className="account-field" type="tel" autoComplete="tel" value={perfil.phone ?? ""} onChange={(e) => cambiarCampo("phone", e.target.value)} />
            </label>
            <label className="account-profile-grid__wide">
              Dirección
              <input className="account-field" autoComplete="street-address" value={perfil.address ?? ""} onChange={(e) => cambiarCampo("address", e.target.value)} />
            </label>
            <label className="account-profile-grid__wide">
              Apartamento, torre, barrio (opcional)
              <input className="account-field" value={perfil.apartment ?? ""} onChange={(e) => cambiarCampo("apartment", e.target.value)} />
            </label>
            <label>
              Departamento
              <select className="account-field" value={perfil.region ?? "Antioquia"} onChange={(e) => cambiarCampo("region", e.target.value)}>
                {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>
              Ciudad
              <input className="account-field" autoComplete="address-level2" value={perfil.city ?? ""} onChange={(e) => cambiarCampo("city", e.target.value)} />
            </label>
          </div>
          <button type="submit" className="primary-action account-submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar mis datos"}
          </button>
          {mensajePerfil && <p className="account-message account-message--success" role="status">{mensajePerfil}</p>}
          {errorPerfil && <p className="account-message account-message--error" role="alert">{errorPerfil}</p>}
        </form>
      </section>

      <CambiarContrasena />

      <div className="account-actions">
        <Link href="/" className="account-home-link secondary-action">Volver a la tienda</Link>
        <button type="button" className="account-logout" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </>
  );
}
