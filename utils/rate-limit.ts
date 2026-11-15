import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/server";

/** IP del visitante (Vercel la pone en x-forwarded-for / x-real-ip). */
function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "desconocida";
}

/**
 * Cuenta una solicitud del visitante y devuelve una respuesta 429 si superó el límite.
 * Si la base de datos falla, deja pasar la solicitud: nunca bloquea una venta por un error nuestro.
 */
export async function limitarSolicitudes(
  request: Request,
  accion: string,
  limite: number,
  ventanaSegundos: number,
) {
  const ipHash = createHash("sha256").update(clientIp(request)).digest("hex").slice(0, 32);

  try {
    const { data, error } = await createSupabaseAdminClient().rpc("hit_rate_limit", {
      p_key: `${accion}:${ipHash}`,
      p_limit: limite,
      p_window_seconds: ventanaSegundos,
    });
    if (error) {
      console.error("Límite de solicitudes no disponible:", error.message);
      return null;
    }
    if (data === false) {
      return NextResponse.json(
        { error: "Hiciste demasiados intentos seguidos. Espera unos minutos e intenta de nuevo.", valid: false, message: "Demasiados intentos. Espera unos minutos." },
        { status: 429, headers: { "Retry-After": String(ventanaSegundos) } },
      );
    }
  } catch (error) {
    console.error("Límite de solicitudes no disponible:", error instanceof Error ? error.message : error);
  }
  return null;
}
