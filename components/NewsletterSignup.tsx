"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje("La suscripción aún no está conectada a una lista de correo. Tu dirección no se envió.");
  };

  return (
    <section id="novedades" className="naya-newsletter">
      <div className="naya-newsletter__inner">
        <div>
          <span className="naya-section-heading__eyebrow">Un momento para ti</span>
          <h2>Recibe novedades botánicas</h2>
          <p>Rituales, consejos de cuidado y noticias de NAYA directamente en tu correo.</p>
        </div>
        <form className="naya-newsletter__form" onSubmit={handleSubmit}>
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
          <button className="naya-button" type="submit">
            Suscribirme <ArrowRight size={15} aria-hidden="true" />
          </button>
          <p className="naya-newsletter__notice" role="status">
            {mensaje || "El formulario aún no está conectado a una lista de correo."}
          </p>
        </form>
      </div>
    </section>
  );
}
