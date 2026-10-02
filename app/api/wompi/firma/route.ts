import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { productos } from "@/utils/productos";

export const runtime = "nodejs";

interface ItemSolicitud {
  id: number;
  cantidad: number;
}

export async function POST(request: Request) {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

  if (!publicKey || !integritySecret) {
    return NextResponse.json(
      { error: "Falta configurar la llave pública o WOMPI_INTEGRITY_SECRET en el servidor." },
      { status: 503 }
    );
  }

  const secretPrefix = publicKey.startsWith("pub_test_")
    ? "test_integrity_"
    : publicKey.startsWith("pub_prod_")
      ? "prod_integrity_"
      : "";

  if (!secretPrefix || !integritySecret.startsWith(secretPrefix)) {
    return NextResponse.json(
      { error: "La llave pública y el secreto de integridad pertenecen a ambientes distintos." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null) as {
    items?: ItemSolicitud[];
    shippingCost?: number;
  } | null;

  if (
    !body ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > 20 ||
    (body.shippingCost !== 25000 && body.shippingCost !== 30000)
  ) {
    return NextResponse.json({ error: "Los datos del pedido no son válidos." }, { status: 400 });
  }

  let subtotal = 0;
  for (const item of body.items) {
    if (
      !Number.isInteger(item.id) ||
      !Number.isInteger(item.cantidad) ||
      item.cantidad < 1 ||
      item.cantidad > 99
    ) {
      return NextResponse.json({ error: "Hay productos o cantidades no válidas en el pedido." }, { status: 400 });
    }

    const producto = productos.find((entry) => entry.id === item.id);
    if (!producto) {
      return NextResponse.json({ error: "El pedido contiene un producto que ya no está disponible." }, { status: 400 });
    }

    subtotal += producto.precio * item.cantidad;
  }

  const amountInCents = (subtotal + body.shippingCost) * 100;
  const reference = `NAYA-${randomUUID()}`;
  const signature = createHash("sha256")
    .update(`${reference}${amountInCents}COP${integritySecret}`)
    .digest("hex");

  return NextResponse.json({ reference, amountInCents, signature });
}