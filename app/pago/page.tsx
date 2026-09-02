"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrdenData {
  formData: {
    nombre: string;
    apellidos: string;
    telefono: string;
    identificacion: string;
    email: string;
    direccion: string;
    apartamento: string;
    poblacion: string;
    departamento: string;
    notas: string;
  };
  costoEnvio: number;
  subtotal: number;
  total: number;
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
}

export default function PaginaPago() {
  const router = useRouter();
  const [orden, setOrden] = useState<OrdenData | null>(null);
  const [metodoPago, setMetodoPago] = useState<string>("tarjeta");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const datosGuardados = localStorage.getItem("orden_pendiente_naya");
    if (datosGuardados) {
      setOrden(JSON.parse(datosGuardados));
    } else {
      router.push("/checkout");
    }
  }, [router]);

  if (!orden) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500">Cargando información del pedido...</div>;
  }

  const confirmarPago = async () => {
    setProcesando(true);

    if (metodoPago === "whatsapp") {
      // Lógica de WhatsApp para transferencia Bancolombia
      let detalleProductos = orden.items
        .map((item) => `- ${item.nombre} x ${item.cantidad} ($${(item.precio * item.cantidad).toLocaleString("es-CO")})`)
        .join("\n");

      const numeroWhatsApp = "573001234567"; // Reemplaza con tu número real
      const mensaje = `Hola Naya, quiero confirmar mi pago por transferencia:\n\n` +
        `*CLIENTE:*\n` +
        `Nombre: ${orden.formData.nombre} ${orden.formData.apellidos}\n` +
        `Teléfono: ${orden.formData.telefono}\n` +
        `*TOTAL A PAGAR: $${orden.total.toLocaleString("es-CO")}*\n\n` +
        `Método de pago: Transferencia Bancolombia\n` +
        `Adjunto comprobante.`;

      const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
      localStorage.removeItem("carrito_naya");
      localStorage.removeItem("orden_pendiente_naya");
      window.location.href = urlWhatsApp;

    } else if (metodoPago === "tarjeta") {
      // PAGO CON TARJETA (MERCADO PAGO)
      try {
        const response = await fetch("/api/crear-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: orden.items.map(item => ({
              title: item.nombre,
              quantity: item.cantidad,
              unit_price: item.precio,
            })),
            shipmentCost: orden.costoEnvio,
            payer: {
              name: orden.formData.nombre,
              surname: orden.formData.apellidos,
              email: orden.formData.email,
            },
          }),
        });

        const data = await response.json();

        if (data.init_point) {
          window.location.href = data.init_point;
        } else {
          alert(data.error || "Hubo un error al iniciar el pago con tarjeta.");
          setProcesando(false);
        }
      } catch (error) {
        console.error(error);
        alert("Error de conexión al procesar la tarjeta.");
        setProcesando(false);
      }
    } else {
      alert(`Método ${metodoPago.toUpperCase()} seleccionado.`);
      setProcesando(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/checkout" className="text-xs text-stone-500 hover:text-emerald-900 font-medium inline-flex items-center gap-1 transition">
            ← Volver a los datos de envío
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200">
          <h1 className="text-xl font-bold text-stone-900 mb-2">Selecciona tu método de pago</h1>
          <p className="text-xs text-stone-500 mb-6">Total a pagar: <span className="font-bold text-stone-900">${orden.total.toLocaleString("es-CO")}</span></p>

          <div className="space-y-3 mb-8">
            
            {/* Tarjeta */}
            <div
              onClick={() => setMetodoPago("tarjeta")}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                metodoPago === "tarjeta" ? "border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600" : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 bg-white shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">Tarjeta</p>
                  <p className="text-xs text-stone-500">Crédito, débito o prepaga</p>
                </div>
              </div>
              <span className="text-stone-400 font-bold text-lg">›</span>
            </div>

            {/* Transferencia Bancolombia */}
            <div
              onClick={() => setMetodoPago("whatsapp")}
              className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                metodoPago === "whatsapp" ? "border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600" : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                NUEVO
              </span>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-800 bg-white shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-11h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5zm0 3h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5zm0 3h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">Transferencia con Bancolombia</p>
                  <p className="text-xs text-stone-500">Envía tu comprobante y valida por WhatsApp</p>
                </div>
              </div>
              <span className="text-stone-400 font-bold text-lg">›</span>
            </div>

          </div>

          <button
            onClick={confirmarPago}
            disabled={procesando}
            className="w-full bg-[#8cc63f] hover:bg-[#7cb433] text-white font-bold py-4 rounded-xl transition duration-200 text-sm shadow-sm cursor-pointer disabled:opacity-50"
          >
            {procesando ? "Conectando con la pasarela..." : metodoPago === "tarjeta" ? "Pagar con Tarjeta" : "Pagar por WhatsApp"}
          </button>
        </div>
      </div>
    </main>
  );
}