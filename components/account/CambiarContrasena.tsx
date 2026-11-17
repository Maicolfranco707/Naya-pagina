"use client";

import { type FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";

// Para crear o cambiar la contraseña (sirve también a quien entró solo con código).
export default function CambiarContrasena() {
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje("");
    setError("");
    if (nueva.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (nueva !== repetir) return setError("Las dos contraseñas no coinciden.");
    setGuardando(true);
    try {
      const { error: updateError } = await createSupabaseBrowserClient().auth.updateUser({ password: nueva });
      if (updateError) throw updateError;
      setNueva("");
      setRepetir("");
      setMensaje("Listo. Ya puedes entrar con tu correo y esta contraseña.");
    } catch (updateError) {
      console.error("No se pudo cambiar la contraseña:", updateError);
      setError("No pudimos guardar la contraseña. Prueba con otra o inténtalo más tarde.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="account-section" aria-labelledby="mi-contrasena">
      <h2 id="mi-contrasena" className="account-section__title">Contraseña</h2>
      <p className="account-section__hint">Crea o cambia tu contraseña para entrar sin esperar el código.</p>
      <form onSubmit={guardar} className="account-profile-form">
        <div className="account-profile-grid">
          <label>
            Nueva contraseña
            <input className="account-field" type="password" autoComplete="new-password" minLength={6} value={nueva} onChange={(e) => setNueva(e.target.value)} required />
          </label>
          <label>
            Repite la contraseña
            <input className="account-field" type="password" autoComplete="new-password" minLength={6} value={repetir} onChange={(e) => setRepetir(e.target.value)} required />
          </label>
        </div>
        <button type="submit" className="primary-action account-submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar contraseña"}
        </button>
        {mensaje && <p className="account-message account-message--success" role="status">{mensaje}</p>}
        {error && <p className="account-message account-message--error" role="alert">{error}</p>}
      </form>
    </section>
  );
}
