"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  Box,
  Check,
  ChevronDown,
  CircleAlert,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";

interface Producto {
  id: number;
  category: string;
  name: string;
  description: string;
  details: string | null;
  price_cop: number;
  image_url: string;
  active: boolean;
  updated_at: string;
}

interface PedidoItem {
  id: number;
  product_name: string;
  unit_price_cop: number;
  quantity: number;
  line_total_cop: number;
}

interface Pedido {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_identification: string;
  customer_company: string | null;
  shipping_country: string;
  shipping_address: string;
  shipping_apartment: string | null;
  shipping_city: string;
  shipping_region: string;
  shipping_postal_code: string | null;
  customer_notes: string | null;
  subtotal_cop: number;
  shipping_cop: number;
  total_cop: number;
  order_status: string;
  payment_status: string;
  payment_provider: string;
  created_at: string;
  order_items: PedidoItem[];
}

interface FormularioProducto {
  id?: number;
  category: string;
  name: string;
  description: string;
  details: string;
  price_cop: string;
  image_url: string;
}

const ESTADOS_PEDIDO = ["pending", "processing", "shipped", "completed", "cancelled"];
const ESTADOS_PAGO: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  declined: "Rechazado",
  voided: "Anulado",
  error: "Error",
};

function formatoPrecio(valor: number) {
  return `$${valor.toLocaleString("es-CO")} COP`;
}

function formatoFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(fecha));
}

function etiquetaEstado(valor: string) {
  return valor.replaceAll("_", " ").replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function formularioVacio(): FormularioProducto {
  return { category: "", name: "", description: "", details: "", price_cop: "", image_url: "" };
}

export default function AdminPage() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [accesoVerificado, setAccesoVerificado] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [iniciando, setIniciando] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [pestana, setPestana] = useState<"pedidos" | "productos">("pedidos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState<FormularioProducto | null>(null);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const verificarSesion = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!data.user) {
          if (activo) setAccesoVerificado(true);
          return;
        }

        const { data: membership, error: membershipError } = await supabase
          .from("admin_users")
          .select("user_id, enabled")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (membershipError) throw membershipError;

        if (activo) {
          setUsuario(data.user);
          setEsAdmin(membership?.enabled === true);
          setAccesoVerificado(true);
          if (membership?.enabled) void cargarDatos();
        }
      } catch (reason) {
        if (activo) {
          setError(reason instanceof Error ? reason.message : "No se pudo verificar el acceso administrativo.");
          setAccesoVerificado(true);
        }
      } finally {
        if (activo) setIniciando(false);
      }
    };

    void verificarSesion();
    return () => {
      activo = false;
    };
  }, []);

  async function cargarDatos() {
    setCargandoDatos(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const [productosResult, pedidosResult] = await Promise.all([
        supabase.from("products").select("*").order("id", { ascending: true }),
        supabase
          .from("orders")
          .select("*, order_items(id, product_name, unit_price_cop, quantity, line_total_cop)")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      const errores: string[] = [];
      if (productosResult.error) {
        errores.push(`Productos: ${productosResult.error.message}`);
      } else {
        setProductos((productosResult.data ?? []) as Producto[]);
      }

      if (pedidosResult.error) {
        errores.push(`Pedidos: ${pedidosResult.error.message}`);
      } else {
        setPedidos((pedidosResult.data ?? []) as Pedido[]);
      }

      setError(errores.join(" "));
    } catch (reason) {
      const message = reason && typeof reason === "object" && "message" in reason
        ? String(reason.message)
        : "No se pudieron cargar los datos administrativos.";
      setError(message);
    } finally {
      setCargandoDatos(false);
    }
  }

  const iniciarSesion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCargando(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      if (!data.user) throw new Error("No se pudo iniciar sesión.");

      const { data: membership, error: membershipError } = await supabase
        .from("admin_users")
        .select("user_id, enabled")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (membershipError) throw membershipError;

      setUsuario(data.user);
      setEsAdmin(membership?.enabled === true);
      setAccesoVerificado(true);
      if (membership?.enabled) await cargarDatos();
      else setError("Esta cuenta no tiene permisos administrativos. Pide al propietario que la autorice en Supabase.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
      setIniciando(false);
    }
  };

  const cerrarSesion = async () => {
    await createSupabaseBrowserClient().auth.signOut();
    setUsuario(null);
    setEsAdmin(false);
    setProductos([]);
    setPedidos([]);
    setMensaje("");
    setError("");
  };

  const guardarProducto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formulario || !Number.isInteger(Number(formulario.price_cop)) || Number(formulario.price_cop) <= 0) {
      setError("Ingresa un precio válido en pesos colombianos.");
      return;
    }

    setGuardandoProducto(true);
    setError("");
    setMensaje("");

    try {
      const supabase = createSupabaseBrowserClient();
      const registro = {
        category: formulario.category.trim(),
        name: formulario.name.trim(),
        description: formulario.description.trim(),
        details: formulario.details.trim() || null,
        price_cop: Number(formulario.price_cop),
        image_url: formulario.image_url.trim(),
        updated_at: new Date().toISOString(),
      };
      const result = formulario.id
        ? await supabase.from("products").update(registro).eq("id", formulario.id)
        : await supabase.from("products").insert(registro);

      if (result.error) throw result.error;
      setFormulario(null);
      setMensaje(formulario.id ? "Producto actualizado." : "Producto creado.");
      await cargarDatos();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar el producto.");
    } finally {
      setGuardandoProducto(false);
    }
  };

  const alternarProducto = async (producto: Producto) => {
    setError("");
    setMensaje("");
    try {
      const { error: updateError } = await createSupabaseBrowserClient()
        .from("products")
        .update({ active: !producto.active, updated_at: new Date().toISOString() })
        .eq("id", producto.id);
      if (updateError) throw updateError;
      setMensaje(producto.active ? "Producto desactivado." : "Producto activado.");
      await cargarDatos();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cambiar el estado del producto.");
    }
  };

  const actualizarEstadoPedido = async (pedido: Pedido, orderStatus: string) => {
    setError("");
    setMensaje("");
    try {
      const { error: updateError } = await createSupabaseBrowserClient()
        .from("orders")
        .update({ order_status: orderStatus, updated_at: new Date().toISOString() })
        .eq("id", pedido.id);
      if (updateError) throw updateError;
      setPedidos((actuales) => actuales.map((item) => item.id === pedido.id ? { ...item, order_status: orderStatus } : item));
      setMensaje(`Pedido ${pedido.reference} actualizado.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el pedido.");
    }
  };

  const productosFiltrados = productos.filter((producto) =>
    `${producto.name} ${producto.category}`.toLowerCase().includes(busqueda.toLowerCase())
  );
  const pedidosFiltrados = pedidos.filter((pedido) =>
    `${pedido.reference} ${pedido.customer_name} ${pedido.customer_email}`.toLowerCase().includes(busqueda.toLowerCase())
  );
  const pedidosPendientes = pedidos.filter((pedido) => pedido.payment_status === "pending").length;
  const pagosAprobados = pedidos.filter((pedido) => pedido.payment_status === "approved").length;

  if (iniciando || !accesoVerificado) {
    return <main className="min-h-screen bg-stone-100 flex items-center justify-center text-sm text-stone-600">Verificando acceso...</main>;
  }

  if (!usuario || !esAdmin) {
    return (
      <main className="min-h-screen bg-stone-100 px-4 py-12 flex items-center justify-center">
        <section className="w-full max-w-md bg-white border border-stone-200 p-8 shadow-sm">
          <Link href="/" className="text-sm font-bold tracking-[0.18em] text-emerald-950">NAYA / ADMIN</Link>
          <h1 className="mt-8 text-2xl font-semibold text-stone-900">Acceso administrativo</h1>
          <p className="mt-2 text-sm text-stone-500">Ingresa con una cuenta autorizada del equipo.</p>
          <form onSubmit={iniciarSesion} className="mt-7 space-y-4">
            <label className="block text-sm font-medium text-stone-700">
              Correo
              <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Contraseña
              <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" />
            </label>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            <button type="submit" disabled={cargando} className="w-full bg-emerald-950 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">
              {cargando ? "Validando..." : "Iniciar sesión"}
            </button>
          </form>
          <Link href="/" className="mt-5 inline-block text-sm text-stone-500 hover:text-emerald-900">Volver a la tienda</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-800">
      <header className="bg-emerald-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={20} aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-emerald-200">NAYA</p>
              <h1 className="text-lg font-semibold">Administración</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-emerald-100 sm:block">{usuario.email}</span>
            <button type="button" onClick={cerrarSesion} className="inline-flex items-center gap-2 border border-white/25 px-3 py-2 text-xs font-medium hover:bg-white/10" aria-label="Cerrar sesión">
              <LogOut size={15} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-emerald-800">Panel de tienda</p>
            <h2 className="mt-1 text-2xl font-semibold text-stone-950">Resumen operativo</h2>
          </div>
          <button type="button" onClick={() => void cargarDatos()} disabled={cargandoDatos} className="inline-flex items-center justify-center gap-2 border border-stone-300 bg-white px-3 py-2 text-sm hover:bg-stone-50 disabled:opacity-50">
            <RefreshCw size={15} className={cargandoDatos ? "animate-spin" : ""} /> Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 border-y border-stone-300 bg-white sm:grid-cols-3">
          <div className="border-b border-stone-200 p-5 sm:border-b-0 sm:border-r">
            <p className="text-xs uppercase text-stone-500">Productos activos</p>
            <p className="mt-2 text-2xl font-semibold">{productos.filter((producto) => producto.active).length}</p>
          </div>
          <div className="border-b border-stone-200 p-5 sm:border-b-0 sm:border-r">
            <p className="text-xs uppercase text-stone-500">Pagos pendientes</p>
            <p className="mt-2 text-2xl font-semibold">{pedidosPendientes}</p>
          </div>
          <div className="p-5">
            <p className="text-xs uppercase text-stone-500">Pagos aprobados</p>
            <p className="mt-2 text-2xl font-semibold">{pagosAprobados}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-b border-stone-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1" role="tablist" aria-label="Secciones administrativas">
            <button type="button" role="tab" aria-selected={pestana === "pedidos"} onClick={() => { setPestana("pedidos"); setBusqueda(""); }} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${pestana === "pedidos" ? "border-emerald-900 text-emerald-950" : "border-transparent text-stone-500 hover:text-stone-900"}`}>
              <ShoppingBag size={16} /> Pedidos
            </button>
            <button type="button" role="tab" aria-selected={pestana === "productos"} onClick={() => { setPestana("productos"); setBusqueda(""); }} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${pestana === "productos" ? "border-emerald-900 text-emerald-950" : "border-transparent text-stone-500 hover:text-stone-900"}`}>
              <Box size={16} /> Productos
            </button>
          </div>
          <label className="mb-3 flex items-center gap-2 border border-stone-300 bg-white px-3 py-2 sm:mb-2 sm:w-72">
            <Search size={16} className="text-stone-400" />
            <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder={pestana === "pedidos" ? "Buscar pedido o cliente" : "Buscar producto"} className="w-full text-sm outline-none" aria-label="Buscar" />
          </label>
        </div>

        {(error || mensaje) && (
          <div className={`mt-5 flex items-start gap-2 border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`} role={error ? "alert" : "status"}>
            {error ? <CircleAlert size={17} className="mt-0.5 shrink-0" /> : <Check size={17} className="mt-0.5 shrink-0" />}
            <span>{error || mensaje}</span>
          </div>
        )}

        {cargandoDatos ? (
          <p className="py-16 text-center text-sm text-stone-500">Cargando datos...</p>
        ) : pestana === "productos" ? (
          <section className="mt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-stone-500">{productosFiltrados.length} productos</p>
              <button type="button" onClick={() => { setError(""); setFormulario(formularioVacio()); }} className="inline-flex items-center gap-2 bg-emerald-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900">
                <Plus size={16} /> Nuevo producto
              </button>
            </div>

            {formulario && (
              <form onSubmit={guardarProducto} className="mb-6 border border-stone-300 bg-white p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-semibold">{formulario.id ? "Editar producto" : "Agregar producto"}</h3>
                  <button type="button" onClick={() => setFormulario(null)} className="p-1 text-stone-500 hover:text-stone-900" aria-label="Cerrar formulario"><X size={18} /></button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-medium text-stone-600">Nombre
                    <input required value={formulario.name} onChange={(event) => setFormulario({ ...formulario, name: event.target.value })} className="mt-1 block w-full border border-stone-300 px-3 py-2 text-sm text-stone-900" />
                  </label>
                  <label className="text-xs font-medium text-stone-600">Categoría
                    <input required value={formulario.category} onChange={(event) => setFormulario({ ...formulario, category: event.target.value })} className="mt-1 block w-full border border-stone-300 px-3 py-2 text-sm text-stone-900" />
                  </label>
                  <label className="text-xs font-medium text-stone-600">Precio COP
                    <input type="number" min="1" step="1" required value={formulario.price_cop} onChange={(event) => setFormulario({ ...formulario, price_cop: event.target.value })} className="mt-1 block w-full border border-stone-300 px-3 py-2 text-sm text-stone-900" />
                  </label>
                  <label className="text-xs font-medium text-stone-600">Ruta o URL de imagen
                    <input required value={formulario.image_url} onChange={(event) => setFormulario({ ...formulario, image_url: event.target.value })} placeholder="/naya_foto/producto.png" className="mt-1 block w-full border border-stone-300 px-3 py-2 text-sm text-stone-900" />
                  </label>
                  <label className="text-xs font-medium text-stone-600 sm:col-span-2">Descripción
                    <textarea required rows={2} value={formulario.description} onChange={(event) => setFormulario({ ...formulario, description: event.target.value })} className="mt-1 block w-full border border-stone-300 px-3 py-2 text-sm text-stone-900" />
                  </label>
                  <label className="text-xs font-medium text-stone-600 sm:col-span-2">Detalles (opcional)
                    <textarea rows={2} value={formulario.details} onChange={(event) => setFormulario({ ...formulario, details: event.target.value })} className="mt-1 block w-full border border-stone-300 px-3 py-2 text-sm text-stone-900" />
                  </label>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setFormulario(null)} className="border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50">Cancelar</button>
                  <button type="submit" disabled={guardandoProducto} className="bg-emerald-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{guardandoProducto ? "Guardando..." : "Guardar producto"}</button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto border border-stone-200 bg-white">
              <table className="w-full min-w-190 text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                  <tr><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {productosFiltrados.map((producto) => (
                    <tr key={producto.id} className="hover:bg-stone-50/70">
                      <td className="px-4 py-3"><p className="font-medium text-stone-900">{producto.name}</p><p className="mt-0.5 text-xs text-stone-500">ID {producto.id}</p></td>
                      <td className="px-4 py-3 text-stone-600">{producto.category}</td>
                      <td className="px-4 py-3 font-medium">{formatoPrecio(producto.price_cop)}</td>
                      <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 text-xs ${producto.active ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>{producto.active ? "Activo" : "Inactivo"}</span></td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setFormulario({ id: producto.id, category: producto.category, name: producto.name, description: producto.description, details: producto.details ?? "", price_cop: String(producto.price_cop), image_url: producto.image_url })} className="inline-flex items-center gap-1.5 border border-stone-300 px-2.5 py-1.5 text-xs hover:bg-stone-100"><Pencil size={13} /> Editar</button>
                        <button type="button" onClick={() => void alternarProducto(producto)} className="border border-stone-300 px-2.5 py-1.5 text-xs hover:bg-stone-100">{producto.active ? "Desactivar" : "Activar"}</button>
                      </div></td>
                    </tr>
                  ))}
                  {productosFiltrados.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-stone-500">No hay productos que coincidan.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="mt-5 space-y-3">
            <p className="mb-4 text-sm text-stone-500">Mostrando hasta los 100 pedidos más recientes.</p>
            {pedidosFiltrados.map((pedido) => (
              <article key={pedido.id} className="border border-stone-200 bg-white">
                <div className="flex flex-col gap-4 border-b border-stone-100 p-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                  <div>
                    <p className="font-semibold text-stone-950">{pedido.reference}</p>
                    <p className="mt-1 text-xs text-stone-500">{formatoFecha(pedido.created_at)} · {pedido.payment_provider === "wompi" ? "Wompi" : "WhatsApp"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-2 py-1 text-xs ${pedido.payment_status === "approved" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>Pago: {ESTADOS_PAGO[pedido.payment_status] ?? etiquetaEstado(pedido.payment_status)}</span>
                    <label className="flex items-center gap-2 text-xs text-stone-500">
                      Pedido
                      <span className="relative">
                        <select value={pedido.order_status} onChange={(event) => void actualizarEstadoPedido(pedido, event.target.value)} className="appearance-none border border-stone-300 bg-white py-1.5 pl-2 pr-7 text-xs text-stone-800">
                          {ESTADOS_PEDIDO.map((estado) => <option key={estado} value={estado}>{etiquetaEstado(estado)}</option>)}
                        </select>
                        <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                      </span>
                    </label>
                  </div>
                </div>
                <div className="grid gap-5 p-4 sm:grid-cols-2 sm:px-5">
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-stone-500">Cliente y envío</h3>
                    <p className="mt-2 text-sm font-medium">{pedido.customer_name}</p>
                    <p className="mt-1 text-sm text-stone-600">{pedido.customer_email} · {pedido.customer_phone}</p>
                    <p className="mt-1 text-sm text-stone-600">{pedido.shipping_address}{pedido.shipping_apartment ? `, ${pedido.shipping_apartment}` : ""}, {pedido.shipping_city}, {pedido.shipping_region}</p>
                    {pedido.customer_notes && <p className="mt-2 text-xs text-stone-500">Nota: {pedido.customer_notes}</p>}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-stone-500">Detalle</h3>
                    <ul className="mt-2 space-y-1.5">
                      {pedido.order_items?.map((item) => <li key={item.id} className="flex justify-between gap-4 text-sm"><span className="text-stone-600">{item.product_name} × {item.quantity}</span><span className="shrink-0">{formatoPrecio(item.line_total_cop)}</span></li>)}
                    </ul>
                    <div className="mt-3 border-t border-stone-100 pt-2 text-sm">
                      <p className="flex justify-between"><span className="text-stone-500">Envío</span><span>{formatoPrecio(pedido.shipping_cop)}</span></p>
                      <p className="mt-1 flex justify-between font-semibold"><span>Total</span><span>{formatoPrecio(pedido.total_cop)}</span></p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {pedidosFiltrados.length === 0 && <p className="border border-stone-200 bg-white px-4 py-12 text-center text-sm text-stone-500">No hay pedidos que coincidan.</p>}
          </section>
        )}
      </div>
    </main>
  );
}