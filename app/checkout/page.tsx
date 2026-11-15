"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Lock, MessageCircle, Minus, Plus, ShoppingBag, Tag, Trash2, Truck, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import { WHATSAPP_NUMBER } from "@/utils/contacto";
import { COLUMNAS_PERFIL, DEPARTAMENTOS, type PerfilCliente } from "@/utils/cuenta-cliente";
import { cotizarEnvio, ENVIO_GRATIS_DESDE } from "@/utils/envios";
import type { Producto } from "@/utils/productos";

interface CartItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  imagen: string;
}

interface StoredCartItem {
  id?: number;
  nombre?: string;
  precio?: number;
  imagen?: string;
  cantidad: number;
  producto?: { id: number; nombre: string; precio: number; imagen?: string };
}

type MetodoPago = "wompi" | "whatsapp";

function pesos(valor: number) {
  return `$${valor.toLocaleString("es-CO")}`;
}

function leerCarrito(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem("carrito_naya") ?? "[]") as StoredCartItem[];
    return parsed
      .map((item) => ({
        id: item.producto?.id ?? item.id ?? 0,
        nombre: item.producto?.nombre ?? item.nombre ?? "",
        cantidad: item.cantidad,
        precio: item.producto?.precio ?? item.precio ?? 0,
        imagen: item.producto?.imagen ?? item.imagen ?? "",
      }))
      .filter((item) => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.cantidad) && item.cantidad > 0);
  } catch (error) {
    console.error("Error al leer el carrito:", error);
    return [];
  }
}

/** Cambia la cantidad (o quita con 0) de un producto en el carrito guardado. */
function actualizarCarritoGuardado(id: number, cantidad: number) {
  try {
    const guardado = JSON.parse(localStorage.getItem("carrito_naya") ?? "[]") as StoredCartItem[];
    const nuevo = guardado
      .map((item) => ((item.producto?.id ?? item.id) === id ? { ...item, cantidad } : item))
      .filter((item) => item.cantidad > 0);
    localStorage.setItem("carrito_naya", JSON.stringify(nuevo));
  } catch (error) {
    console.error("No se pudo actualizar el carrito:", error);
  }
}

/** Abre el checkout de Wompi con la firma de integridad generada en el servidor. */
async function irAWompi(orderId: string, email: string) {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  if (!publicKey) throw new Error("Falta configurar la llave pública de Wompi.");

  const response = await fetch("/api/wompi/firma", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const firma = await response.json() as { reference?: string; amountInCents?: number; signature?: string; error?: string };
  if (!response.ok || !firma.reference || !firma.amountInCents || !firma.signature) {
    throw new Error(firma.error || "No se pudo preparar el pago con Wompi.");
  }

  const campos: Record<string, string> = {
    "public-key": publicKey,
    currency: "COP",
    "amount-in-cents": String(firma.amountInCents),
    reference: firma.reference,
    "signature:integrity": firma.signature,
    "customer-data:email": email,
  };
  if (window.location.protocol === "https:") {
    const redirectUrl = new URL("/checkout/confirmacion", window.location.origin);
    redirectUrl.searchParams.set("reference", firma.reference);
    campos["redirect-url"] = redirectUrl.toString();
  }

  const form = document.createElement("form");
  form.method = "GET";
  form.action = "https://checkout.wompi.co/p/";
  for (const [name, value] of Object.entries(campos)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("wompi");
  const [items, setItems] = useState<CartItem[]>([]);
  const [cargado, setCargado] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteEmail, setClienteEmail] = useState("");
  const [guardarDatos, setGuardarDatos] = useState(true);
  const [resumenAbierto, setResumenAbierto] = useState(false);
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cupon, setCupon] = useState<{ code: string; discount: number } | null>(null);
  const [mensajeCupon, setMensajeCupon] = useState("");
  const [validandoCupon, setValidandoCupon] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    empresa: "",
    identificacion: "",
    pais: "Colombia",
    direccion: "",
    apartamento: "",
    departamento: "Antioquia",
    poblacion: "",
    codigoPostal: "",
    telefono: "",
    email: "",
    notas: "",
  });

  // Carrito + datos actuales del catálogo (nombres, precios y fotos al día).
  useEffect(() => {
    let activo = true;
    const metodo = new URLSearchParams(window.location.search).get("metodo");
    const guardados = leerCarrito();

    const cargar = async () => {
      let actualizados = guardados;
      try {
        const response = await fetch("/api/productos");
        if (response.ok) {
          const catalogo = await response.json() as Producto[];
          const porId = new Map(catalogo.map((producto) => [producto.id, producto]));
          const disponibles = guardados.filter((item) => porId.has(item.id));
          if (disponibles.length < guardados.length) {
            setAviso("Quitamos del pedido productos que ya no están disponibles.");
          }
          actualizados = disponibles.map((item) => {
            const producto = porId.get(item.id)!;
            return { ...item, nombre: producto.nombre.trim(), precio: producto.precio, imagen: producto.imagen };
          });
        }
      } catch (reason) {
        console.error("No se pudo actualizar el catálogo del checkout:", reason);
      }
      if (!activo) return;
      if (metodo === "whatsapp") setMetodoPago("whatsapp");
      setItems(actualizados);
      setCargado(true);
    };

    void cargar();
    return () => {
      activo = false;
    };
  }, []);

  // Si inició sesión: correo, nombre y datos de envío guardados.
  useEffect(() => {
    let activo = true;
    const cargarCliente = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const user = data.session?.user ?? null;
        if (!activo || !user) return;
        setClienteId(user.id);
        setClienteEmail(user.email ?? "");

        const metadata = user.user_metadata ?? {};
        const nombreCompleto = typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
        const [nombre = "", ...apellidos] = nombreCompleto.split(/\s+/);
        setFormData((actual) => ({
          ...actual,
          email: actual.email || user.email || "",
          nombre: actual.nombre || nombre,
          apellidos: actual.apellidos || apellidos.join(" "),
          telefono: actual.telefono || (typeof metadata.phone === "string" ? metadata.phone : ""),
        }));

        const { data: perfil, error: perfilError } = await supabase
          .from("customer_profiles")
          .select(COLUMNAS_PERFIL)
          .eq("user_id", user.id)
          .maybeSingle();
        if (perfilError) throw perfilError;
        if (!activo || !perfil) return;
        const p = perfil as PerfilCliente;
        setFormData((actual) => ({
          ...actual,
          nombre: p.first_name || actual.nombre,
          apellidos: p.last_name || actual.apellidos,
          identificacion: p.identification || actual.identificacion,
          telefono: p.phone || actual.telefono,
          direccion: p.address || actual.direccion,
          apartamento: p.apartment || actual.apartamento,
          departamento: p.region && DEPARTAMENTOS.includes(p.region) ? p.region : actual.departamento,
          poblacion: p.city || actual.poblacion,
          codigoPostal: p.postal_code || actual.codigoPostal,
        }));
      } catch (reason) {
        console.error("No se pudieron cargar los datos del cliente:", reason);
      }
    };
    void cargarCliente();
    return () => {
      activo = false;
    };
  }, []);

  const subtotal = useMemo(() => items.reduce((suma, item) => suma + item.precio * item.cantidad, 0), [items]);
  const descuento = cupon ? Math.min(cupon.discount, subtotal) : 0;
  // Misma regla que shipping_quote en Supabase (la que realmente cobra).
  const envio = cotizarEnvio(formData.departamento, formData.poblacion, subtotal - descuento);
  const costoEnvio = envio.costo;
  const total = subtotal - descuento + costoEnvio;
  const faltaParaGratis = Math.max(0, ENVIO_GRATIS_DESDE - (subtotal - descuento));

  const validarCupon = async (codigo: string, monto: number) => {
    setValidandoCupon(true);
    try {
      const response = await fetch("/api/cupones/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codigo, subtotal: monto, email: formData.email, phone: formData.telefono, identification: formData.identificacion }),
      });
      const result = await response.json() as { valid?: boolean; code?: string; discount?: number; message?: string };
      if (result.valid && result.code) {
        setCupon({ code: result.code, discount: Number(result.discount) || 0 });
        setMensajeCupon("");
        setCodigoCupon("");
      } else {
        setCupon(null);
        setMensajeCupon(result.message || "Este código no es válido.");
      }
    } catch {
      setMensajeCupon("No pudimos validar el código. Intenta de nuevo.");
    } finally {
      setValidandoCupon(false);
    }
  };

  // Si cambia el carrito, el porcentaje se recalcula sobre el nuevo subtotal.
  const codigoAplicado = cupon?.code;
  useEffect(() => {
    if (codigoAplicado && subtotal > 0) void validarCupon(codigoAplicado, subtotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, codigoAplicado]);
  const unidades = items.reduce((suma, item) => suma + item.cantidad, 0);

  const cambiar = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((actual) => ({ ...actual, [name]: value }));
  };

  const enviar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }
    setEnviando(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: sesion } = await supabase.auth.getSession();
      const accessToken = sesion.session?.access_token;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          customer: formData,
          items: items.map(({ id, cantidad }) => ({ id, cantidad })),
          paymentProvider: metodoPago,
          couponCode: cupon?.code ?? null,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.couponError) {
          setCupon(null);
          setMensajeCupon(result.error);
        }
        throw new Error(result.error || "No se pudo guardar el pedido.");
      }

      if (clienteId && guardarDatos) {
        const { error: perfilError } = await supabase.from("customer_profiles").upsert({
          user_id: clienteId,
          first_name: formData.nombre.trim() || null,
          last_name: formData.apellidos.trim() || null,
          identification: formData.identificacion.trim() || null,
          phone: formData.telefono.trim() || null,
          address: formData.direccion.trim() || null,
          apartment: formData.apartamento.trim() || null,
          region: formData.departamento,
          city: formData.poblacion.trim() || null,
          postal_code: formData.codigoPostal.trim() || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
        if (perfilError) console.error("No se pudieron guardar los datos de envío:", perfilError.message);
      }

      localStorage.setItem("orden_pendiente_naya", JSON.stringify({
        id: result.id,
        reference: result.reference,
        formData: { email: formData.email },
        costoEnvio: result.shippingCost,
        subtotal: result.subtotal,
        total: result.total,
        items,
      }));

      if (metodoPago === "whatsapp") {
        const detalle = items.map((item) => `- ${item.nombre} x ${item.cantidad}`).join("\n");
        const mensaje = `Hola NAYA, quiero confirmar el pedido ${result.reference}.\n\n${detalle}\n\nTotal: ${pesos(Number(result.total))} COP\nNombre: ${formData.nombre} ${formData.apellidos}\nCiudad: ${formData.poblacion}\nTeléfono: ${formData.telefono}`;
        window.location.assign(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`);
        return;
      }

      try {
        await irAWompi(result.id, formData.email);
      } catch (wompiError) {
        // El pedido ya quedó guardado: la página de pago permite reintentar sin duplicarlo.
        console.error("No se pudo abrir Wompi desde el checkout:", wompiError);
        router.push("/checkout/pago");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar el pedido. Intenta nuevamente.");
      setEnviando(false);
    }
  };

  const cambiarCantidad = (id: number, cantidad: number) => {
    const nueva = Math.max(0, Math.min(99, cantidad));
    actualizarCarritoGuardado(id, nueva);
    setItems((actual) => actual
      .map((item) => (item.id === id ? { ...item, cantidad: nueva } : item))
      .filter((item) => item.cantidad > 0));
  };

  const resumen = (
    <>
      <ul className="naya-co-items">
        {items.map((item) => (
          <li key={item.id}>
            <div className="naya-co-items__thumb">
              {item.imagen && <Image src={item.imagen} alt="" fill sizes="64px" className="object-cover" />}
              <span>{item.cantidad}</span>
            </div>
            <div className="naya-co-items__info">
              <p>{item.nombre}</p>
              <div className="naya-co-items__controls">
                <div className="naya-co-qty" aria-label={`Cantidad de ${item.nombre}`}>
                  <button type="button" onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} aria-label="Quitar una unidad" disabled={enviando}><Minus size={13} /></button>
                  <span>{item.cantidad}</span>
                  <button type="button" onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} aria-label="Agregar una unidad" disabled={enviando}><Plus size={13} /></button>
                </div>
                <button type="button" className="naya-co-remove" onClick={() => cambiarCantidad(item.id, 0)} disabled={enviando} aria-label={`Eliminar ${item.nombre} del pedido`}>
                  <Trash2 size={14} aria-hidden="true" /> Eliminar
                </button>
              </div>
            </div>
            <strong>{pesos(item.precio * item.cantidad)}</strong>
          </li>
        ))}
      </ul>
      <div className="naya-co-coupon">
        <div className="naya-co-coupon__row">
          <input
            value={codigoCupon}
            onChange={(e) => { setCodigoCupon(e.target.value.toUpperCase()); setMensajeCupon(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (codigoCupon.trim()) void validarCupon(codigoCupon.trim(), subtotal); } }}
            placeholder="Código de descuento"
            aria-label="Código de descuento"
            maxLength={30}
          />
          <button type="button" disabled={!codigoCupon.trim() || validandoCupon} onClick={() => validarCupon(codigoCupon.trim(), subtotal)}>
            {validandoCupon ? "..." : "Aplicar"}
          </button>
        </div>
        {mensajeCupon && <p className="naya-co-coupon__error">{mensajeCupon}</p>}
        {cupon && (
          <span className="naya-co-coupon__chip">
            <Tag size={13} aria-hidden="true" /> {cupon.code}
            <button type="button" aria-label="Quitar código" onClick={() => setCupon(null)}><X size={13} /></button>
          </span>
        )}
      </div>
      <dl className="naya-co-totals">
        <div><dt>Subtotal · {unidades} {unidades === 1 ? "producto" : "productos"}</dt><dd>{pesos(subtotal)}</dd></div>
        {descuento > 0 && <div className="naya-co-totals__discount"><dt>Descuento ({cupon?.code})</dt><dd>−{pesos(descuento)}</dd></div>}
        <div><dt>Envío</dt><dd>{costoEnvio === 0 ? "Gratis" : pesos(costoEnvio)}</dd></div>
        <div className="naya-co-totals__total"><dt>Total</dt><dd><small>COP</small> {pesos(total)}</dd></div>
      </dl>
    </>
  );

  if (cargado && items.length === 0) {
    return (
      <main className="naya-co naya-co--empty">
        <Link href="/" className="naya-co__logo">NAYA</Link>
        <ShoppingBag size={40} strokeWidth={1.4} aria-hidden="true" />
        <h1>Tu carrito está vacío</h1>
        {aviso && <p>{aviso}</p>}
        <Link href="/#catalogo" className="naya-co__pay">Ver productos</Link>
      </main>
    );
  }

  return (
    <main className="naya-co">
      <header className="naya-co__header">
        <Link href="/" className="naya-co__logo">NAYA</Link>
        <Link href="/" className="naya-co__back">Seguir comprando</Link>
      </header>

      <div className="naya-co__mobile-summary">
        <button type="button" onClick={() => setResumenAbierto((abierto) => !abierto)} aria-expanded={resumenAbierto}>
          <span>
            <ShoppingBag size={17} aria-hidden="true" />
            {resumenAbierto ? "Ocultar resumen del pedido" : "Mostrar resumen del pedido"}
            <ChevronDown size={16} aria-hidden="true" className={resumenAbierto ? "naya-co__chev naya-co__chev--open" : "naya-co__chev"} />
          </span>
          <strong>{pesos(total)}</strong>
        </button>
        {resumenAbierto && <div className="naya-co__mobile-summary-body">{resumen}</div>}
      </div>

      <div className="naya-co__layout">
        <form className="naya-co__form" onSubmit={enviar}>
          <section className="naya-co__section">
            <div className="naya-co__section-head">
              <h2>Contacto</h2>
              {!clienteId && <Link href="/cuenta">Iniciar sesión</Link>}
            </div>
            {clienteId ? (
              <p className="naya-co__hint">Comprando como <strong>{clienteEmail}</strong></p>
            ) : null}
            <label className="naya-co__field">
              <span>Correo electrónico</span>
              <input type="email" name="email" required autoComplete="email" value={formData.email} onChange={cambiar} />
            </label>
          </section>

          <section className="naya-co__section">
            <h2>Entrega</h2>
            <div className="naya-co__static">
              <span>País</span>
              <strong>Colombia</strong>
            </div>
            <div className="naya-co__row">
              <label className="naya-co__field">
                <span>Nombre</span>
                <input name="nombre" required autoComplete="given-name" value={formData.nombre} onChange={cambiar} />
              </label>
              <label className="naya-co__field">
                <span>Apellidos</span>
                <input name="apellidos" required autoComplete="family-name" value={formData.apellidos} onChange={cambiar} />
              </label>
            </div>
            <label className="naya-co__field">
              <span>Cédula o NIT</span>
              <input name="identificacion" required inputMode="numeric" value={formData.identificacion} onChange={cambiar} />
            </label>
            <label className="naya-co__field">
              <span>Dirección</span>
              <input name="direccion" required autoComplete="address-line1" placeholder="Ej: Calle 10 # 43-25" value={formData.direccion} onChange={cambiar} />
            </label>
            <label className="naya-co__field">
              <span>Casa, apartamento, barrio o punto de referencia (opcional)</span>
              <input name="apartamento" autoComplete="address-line2" value={formData.apartamento} onChange={cambiar} />
            </label>
            <div className="naya-co__row naya-co__row--3">
              <label className="naya-co__field">
                <span>Ciudad o municipio</span>
                <input name="poblacion" required autoComplete="address-level2" value={formData.poblacion} onChange={cambiar} />
              </label>
              <label className="naya-co__field">
                <span>Departamento</span>
                <select name="departamento" required value={formData.departamento} onChange={cambiar}>
                  {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label className="naya-co__field">
                <span>Código postal (opcional)</span>
                <input name="codigoPostal" inputMode="numeric" autoComplete="postal-code" value={formData.codigoPostal} onChange={cambiar} />
              </label>
            </div>
            <label className="naya-co__field">
              <span>Celular</span>
              <input type="tel" name="telefono" required autoComplete="tel" placeholder="Para coordinar la entrega" value={formData.telefono} onChange={cambiar} />
            </label>
            {clienteId && (
              <label className="naya-co__check">
                <input type="checkbox" checked={guardarDatos} onChange={(e) => setGuardarDatos(e.target.checked)} />
                Guardar mis datos para comprar más rápido la próxima vez
              </label>
            )}
            <details className="naya-co__notes">
              <summary>Agregar una nota al pedido</summary>
              <textarea name="notas" rows={2} value={formData.notas} onChange={cambiar} placeholder="Ej: entregar en portería" />
            </details>
          </section>

          <section className="naya-co__section">
            <h2>Método de envío</h2>
            <div className="naya-co__options">
              <div className="naya-co__option naya-co__option--active">
                <Truck size={18} aria-hidden="true" />
                <span className="naya-co__option-text">
                  <strong>Envío estándar · {envio.zona}</strong>
                  <small>{envio.tiempo}</small>
                </span>
                <strong>{envio.gratis ? "Gratis" : pesos(costoEnvio)}</strong>
              </div>
            </div>
            <p className="naya-co__hint">
              {envio.gratis
                ? "¡Tu pedido tiene envío gratis!"
                : `Te faltan ${pesos(faltaParaGratis)} para el envío gratis (compras desde ${pesos(ENVIO_GRATIS_DESDE)}).`}
            </p>
          </section>

          <section className="naya-co__section">
            <h2>Pago</h2>
            <p className="naya-co__hint"><Lock size={13} aria-hidden="true" /> Todas las transacciones son seguras y están encriptadas.</p>
            <div className="naya-co__options">
              <label className={metodoPago === "wompi" ? "naya-co__option naya-co__option--active" : "naya-co__option"}>
                <input type="radio" name="pago" checked={metodoPago === "wompi"} onChange={() => setMetodoPago("wompi")} />
                <span className="naya-co__option-text">
                  <strong>Tarjeta, PSE, Nequi o Bancolombia</strong>
                  <small>Pagas en la página segura de Wompi y vuelves a NAYA</small>
                </span>
                <span className="naya-co__brands" aria-hidden="true">
                  <span>VISA</span><span>MC</span><span>PSE</span>
                </span>
              </label>
              <label className={metodoPago === "whatsapp" ? "naya-co__option naya-co__option--active" : "naya-co__option"}>
                <input type="radio" name="pago" checked={metodoPago === "whatsapp"} onChange={() => setMetodoPago("whatsapp")} />
                <span className="naya-co__option-text">
                  <strong>Transferencia por WhatsApp</strong>
                  <small>Te enviamos los datos y confirmamos tu pago por chat</small>
                </span>
                <MessageCircle size={20} aria-hidden="true" />
              </label>
            </div>
          </section>

          {aviso && <p className="naya-co__notice">{aviso}</p>}
          {error && <p className="naya-co__error" role="alert">{error}</p>}

          <button type="submit" className="naya-co__pay" disabled={enviando || !cargado}>
            {enviando
              ? "Procesando..."
              : metodoPago === "whatsapp"
                ? "Enviar pedido por WhatsApp"
                : `Pagar ${pesos(total)}`}
          </button>
          <p className="naya-co__legal">
            Al continuar aceptas nuestros <Link href="/terminos">Términos y condiciones</Link> y la{" "}
            <Link href="/privacidad">Política de privacidad</Link>.
          </p>
        </form>

        <aside className="naya-co__summary" aria-label="Resumen del pedido">
          {cargado ? resumen : <p className="naya-co__hint">Cargando tu pedido...</p>}
        </aside>
      </div>
    </main>
  );
}
