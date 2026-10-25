"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";

export default function IngresarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [code, setCode] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [esperaReenvio, setEsperaReenvio] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;
    void Promise.resolve()
      .then(() => createSupabaseBrowserClient().auth.getSession())
      .then(({ data, error: sessionError }) => {
        if (sessionError) {
          console.error("No se pudo comprobar la sesión de Supabase:", sessionError.message);
          return;
        }
        if (activo && data.session) router.replace("/cuenta");
      })
      .catch((sessionError: unknown) => {
        console.error("No se pudo comprobar la sesión de Supabase:", sessionError);
        if (activo) setError("No pudimos conectar con el inicio de sesión. Intenta de nuevo más tarde.");
      });

    return () => {
      activo = false;
    };
  }, [router]);

  useEffect(() => {
    if (esperaReenvio <= 0) return;
    const timer = window.setTimeout(() => setEsperaReenvio((actual) => actual - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [esperaReenvio]);

  const solicitarCodigo = async () => {
    setCargando(true);
    setError("");
    setAviso("");

    try {
      const { error: otpError } = await createSupabaseBrowserClient().auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: { marketing_opt_in: marketingOptIn },
        },
      });

      if (otpError) throw otpError;
      setCodigoEnviado(true);
      setEsperaReenvio(30);
      setAviso(`Te enviamos un código de 6 dígitos a ${email.trim()}.`);
    } catch (sendError) {
      console.error("No se pudo enviar el código de acceso:", sendError);
      setError("No pudimos enviar el código. Revisa el correo e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const enviarCodigo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await solicitarCodigo();
  };

  const verificarCodigo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Escribe el código completo de 6 dígitos.");
      return;
    }

    setCargando(true);
    setError("");
    setAviso("");

    try {
      const { error: verifyError } = await createSupabaseBrowserClient().auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "email",
      });

      if (verifyError) throw verifyError;
      router.replace("/cuenta");
    } catch (verifyError) {
      console.error("No se pudo verificar el código de acceso:", verifyError);
      setError("El código no es válido o venció. Revísalo o solicita uno nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const volverAlCorreo = () => {
    setCodigoEnviado(false);
    setCode("");
    setError("");
    setAviso("");
  };

  return (
    <main className="storefront account-page">
      <section className="account-card" aria-labelledby="account-title">
        <Link href="/" className="account-logo" aria-label="NAYA, volver al inicio">NAYA</Link>

        {!codigoEnviado ? (
          <>
            <p className="account-eyebrow">TU ESPACIO NAYA</p>
            <h1 id="account-title">Iniciar sesión</h1>
            <p className="account-subtitle">Ingresa tu correo para entrar o crear tu cuenta</p>

            <form onSubmit={enviarCodigo} className="account-form">
              <label htmlFor="account-email">Correo electrónico</label>
              <div className="account-input-wrap">
                <Mail size={19} aria-hidden="true" />
                <input
                  id="account-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={cargando}
                />
                <button type="submit" aria-label="Enviar código" disabled={cargando}>
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>

              <label className="account-consent">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(event) => setMarketingOptIn(event.target.checked)}
                  disabled={cargando}
                />
                <span>Quiero recibir novedades y ofertas por correo</span>
              </label>
            </form>
          </>
        ) : (
          <>
            <div className="account-confirm-icon"><CheckCircle2 size={26} aria-hidden="true" /></div>
            <p className="account-eyebrow">REVISA TU CORREO</p>
            <h1 id="account-title">Ingresa tu código</h1>
            <p className="account-subtitle">Enviamos un código de 6 dígitos a <strong>{email.trim()}</strong>.</p>

            <form onSubmit={verificarCodigo} className="account-form">
              <label htmlFor="account-code">Código de verificación</label>
              <input
                id="account-code"
                className="account-code-input"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                disabled={cargando}
                autoFocus
              />
              <button className="account-submit" type="submit" disabled={cargando || code.length !== 6}>
                {cargando ? "Verificando..." : "Verificar código"}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>

            <button
              type="button"
              className="account-resend"
              onClick={() => void solicitarCodigo()}
              disabled={cargando || esperaReenvio > 0}
            >
              {esperaReenvio > 0 ? `Reenviar código en ${esperaReenvio}s` : "Reenviar código"}
            </button>
            <button type="button" className="account-back" onClick={volverAlCorreo}>
              <ArrowLeft size={15} aria-hidden="true" /> Cambiar correo
            </button>
          </>
        )}

        {aviso && <p className="account-message account-message--success" role="status">{aviso}</p>}
        {error && <p className="account-message account-message--error" role="alert">{error}</p>}

        <p className="account-legal">
          Al continuar, aceptas nuestros <Link href="/terminos">Términos y condiciones</Link> y nuestra{" "}
          <Link href="/privacidad">Política de privacidad</Link>.
        </p>
      </section>
    </main>
  );
}
