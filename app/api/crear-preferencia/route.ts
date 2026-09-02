import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Obtenemos el origen o usamos localhost por defecto para evitar que falle
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: "1",
            title: String(body.title || "Producto de Naya"),
            quantity: Number(body.quantity) || 1,
            unit_price: Number(body.price) || 10000,
            currency_id: "COP",
          },
        ],
        back_urls: {
          success: `${origin}/pago`,
          failure: `${origin}/pago`,
          pending: `${origin}/pago`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    return NextResponse.json(
      { error: "Error al conectar con Mercado Pago" },
      { status: 500 }
    );
  }
}