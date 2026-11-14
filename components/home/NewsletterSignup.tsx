"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";

const CUPON = "BIENVENIDA10";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"inicio" | "enviando" | "listo">("inicio");
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEstado("enviando");
    setError("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos suscribirte.");
      setEstado("listo");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No pudimos suscribirte.");
      setEstado("inicio");
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(CUPON);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Si el navegador no deja copiar, el código sigue visible.
    }
  };

  return (
    <section id="novedades" className="naya-nl">
      <div className="naya-nl__card">
        <p className="naya-nl__eyebrow">Club NAYA</p>
        <h2>10% de descuento en tu primera compra</h2>

        {estado === "listo" ? (
          <div className="naya-nl__done" role="status">
            <p>¡Ya eres parte del club! Usa este código al pagar:</p>
            <button type="button" className="naya-nl__code" onClick={copiar}>
              {CUPON} {copiado ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              <span className="sr-only">{copiado ? "Copiado" : "Copiar código"}</span>
            </button>
          </div>
        ) : (
          <>
            <p className="naya-nl__text">Suscríbete y recibe primero los descuentos, lanzamientos y consejos para tu cabello y tu piel.</p>
            <form className="naya-nl__form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="naya-newsletter-email">Tu correo electrónico</label>
              <input
                id="naya-newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button type="submit" disabled={estado === "enviando"}>
                {estado === "enviando" ? "Enviando..." : <>Quiero mi 10% <ArrowRight size={15} aria-hidden="true" /></>}
              </button>
            </form>
            {error && <p className="naya-nl__error" role="alert">{error}</p>}
            <p className="naya-nl__fine">Sin spam. Te puedes dar de baja cuando quieras.</p>
          </>
        )}
      </div>
    </section>
  );
}
