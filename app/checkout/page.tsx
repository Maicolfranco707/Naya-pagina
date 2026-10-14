"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState, useEffect } from "react";
import Link from "next/link";

interface CartItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface StoredCartItem {
  id?: number;
  nombre?: string;
  precio?: number;
  cantidad: number;
  producto?: { id: number; nombre: string; precio: number };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [metodoPago, setMetodoPago] = useState<"wompi" | "whatsapp">("wompi");

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    empresa: "",
    identificacion: "",
    pais: "Colombia",
    direccion: "",
    apartamento: "",
    departamento: "Antioquia",
    poblacion: "Medellín",
    codigoPostal: "050011",
    telefono: "",
    email: "",
    notas: "",
  });

  const [costoEnvio, setCostoEnvio] = useState<number>(25000);
  const [aceptaTerminos, setAceptaTerminos] = useState<boolean>(true);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    startTransition(() => {
      setMetodoPago(new URLSearchParams(window.location.search).get("metodo") === "whatsapp" ? "whatsapp" : "wompi");
    });
    const carritoGuardado = localStorage.getItem("carrito_naya");
    if (carritoGuardado) {
      try {
        const parsed = JSON.parse(carritoGuardado) as StoredCartItem[];
        const itemsFormateados = parsed.map((item) => ({
          id: item.producto?.id ?? item.id ?? 0,
          nombre: item.producto?.nombre ?? item.nombre ?? "",
          cantidad: item.cantidad,
          precio: item.producto?.precio ?? item.precio ?? 0,
        })).filter((item) => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.cantidad) && item.cantidad > 0);
        startTransition(() => setItems(itemsFormateados));
      } catch (e) {
        console.error("Error al leer el carrito:", e);
      }
    }
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const total = subtotal + costoEnvio;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptaTerminos) {
      alert("Debes aceptar los términos y condiciones para continuar.");
      return;
    }
    if (items.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    setLoading(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: items.map(({ id, cantidad }) => ({ id, cantidad })),
          shippingCost: costoEnvio,
          paymentProvider: metodoPago,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar el pedido.");

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
        const mensaje = `Hola NAYA, quiero confirmar el pedido ${result.reference}.\n\n${detalle}\n\nTotal: $${Number(result.total).toLocaleString("es-CO")} COP\nNombre: ${formData.nombre} ${formData.apellidos}\nTeléfono: ${formData.telefono}`;
        window.location.assign(`https://wa.me/573042051221?text=${encodeURIComponent(mensaje)}`);
      } else {
        router.push("/checkout/pago");
      }
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "No se pudo guardar el pedido. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-xs text-stone-500 hover:text-emerald-900 font-medium inline-flex items-center gap-1 transition">
            ← Volver a la tienda
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold text-stone-900 mb-6 pb-2 border-b border-stone-100">
              Detalles de facturación y envío
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-stone-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-stone-800">Nombre *</label>
                  <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600" />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-stone-800">Apellidos *</label>
                  <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600" />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-stone-800">Número de Identificación *</label>
                <input type="text" name="identificacion" required value={formData.identificacion} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              </div>

              <div>
                <label className="block mb-1 font-medium text-stone-800">Dirección de la calle *</label>
                <input type="text" name="direccion" required value={formData.direccion} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 mb-2" />
                <input type="text" name="apartamento" value={formData.apartamento} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-stone-800">Departamento *</label>
                  <select name="departamento" value={formData.departamento} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md bg-white">
                    <option value="Antioquia">Antioquia</option>
                    <option value="Bogotá D.C.">Bogotá D.C.</option>
                    <option value="Cundinamarca">Cundinamarca</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-stone-800">Población</label>
                  <select name="poblacion" value={formData.poblacion} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md bg-white">
                    <option value="Medellín">Medellín</option>
                    <option value="Bello">Bello</option>
                    <option value="Envigado">Envigado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-stone-800">Teléfono *</label>
                <input type="tel" name="telefono" required value={formData.telefono} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              </div>

              <div>
                <label className="block mb-1 font-medium text-stone-800">Correo electrónico *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              </div>

              <div>
                <label className="block mb-1 font-medium text-stone-800">Notas del pedido (opcional)</label>
                <textarea name="notas" rows={2} value={formData.notas} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-md" />
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN Y BOTÓN CONTINUAR */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200 sticky top-6">
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-b border-stone-100 pb-2">Tu pedido</h2>

            <div className="space-y-3 pb-3 border-b border-stone-200">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <span className="text-stone-700">{item.nombre} × {item.cantidad}</span>
                  <span className="font-semibold text-stone-900">${(item.precio * item.cantidad).toLocaleString("es-CO")}</span>
                </div>
              ))}
            </div>

            <div className="py-3 border-b border-stone-200 flex justify-between items-center text-sm">
              <span className="font-semibold text-stone-700">Subtotal</span>
              <span className="font-semibold text-stone-900">${subtotal.toLocaleString("es-CO")}</span>
            </div>

            <div className="py-4 space-y-3 border-b border-stone-200">
              <span className="text-sm font-semibold text-stone-700 block">Envío</span>
              <label onClick={() => setCostoEnvio(25000)} className={`flex justify-between p-3 rounded-xl border text-xs cursor-pointer ${costoEnvio === 25000 ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600" : "border-stone-200"}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" checked={costoEnvio === 25000} onChange={() => setCostoEnvio(25000)} />
                  <span>Capitales</span>
                </div>
                <span className="font-bold">$25.000</span>
              </label>
              <label onClick={() => setCostoEnvio(30000)} className={`flex justify-between p-3 rounded-xl border text-xs cursor-pointer ${costoEnvio === 30000 ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600" : "border-stone-200"}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" checked={costoEnvio === 30000} onChange={() => setCostoEnvio(30000)} />
                  <span>Otras Ciudades</span>
                </div>
                <span className="font-bold">$30.000</span>
              </label>
            </div>

            <div className="py-3 border-b border-stone-200 flex justify-between items-center mb-6 mt-4">
              <span className="text-base font-semibold text-stone-800">Total</span>
              <span className="text-xl font-bold text-stone-900">${total.toLocaleString("es-CO")}</span>
            </div>

            <div className="space-y-4">
              {checkoutError && <p className="text-sm text-red-700" role="alert">{checkoutError}</p>}
              <label className="flex items-start gap-2 text-xs text-stone-700 cursor-pointer">
                <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} className="mt-0.5 rounded text-emerald-600" />
                <span>He leído y acepto los términos y condiciones *</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8cc63f] hover:bg-[#7cb433] text-white font-bold py-3.5 rounded-xl transition text-sm shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? "Guardando pedido..." : metodoPago === "whatsapp" ? "Guardar pedido y continuar por WhatsApp" : "Realizar el pedido (Ir a elegir pago)"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}