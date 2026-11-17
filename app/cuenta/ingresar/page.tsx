"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";

// Después de entrar vuelve a /cuenta, o al admin o al producto desde donde se llegó.
function destinoDespuesDeEntrar() {
  if (typeof window === "undefined") return "/cuenta";
  const volver = new URLSearchParams(window.location.search).get("volver") ?? "";
  // Solo rutas de esta tienda: el admin o la página de un producto.
  if (volver === "/admin" || /^\/producto\/[a-z0-9-]+$/.test(volver)) return volver;
  return "/cuenta";
}

type Vista = "login" | "registro" | "pedirCodigo" | "codigo" | "nuevaClave";

export default function IngresarPage() {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [code, setCode] = useState("");
  const [esperaReenvio, setEsperaReenvio] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  // true cuando la persona entra por "Olvidé mi contraseña": después del código crea una nueva.
  const [olvido, setOlvido] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("olvide") === "1") {
      setOlvido(true);
      setVista("pedirCodigo");
    }
  }, []);

  useEffect(() => {
    let activo = true;
    void Promise.resolve()
      .then(() => createSupabaseBrowserClient().auth.getSession())
      .then(({ data }) => {
        if (activo && data.session) router.replace(destinoDespuesDeEntrar());
      })
      .catch((sessionError: unknown) => {
        console.error("No se pudo comprobar la sesión de Supabase:", sessionError);
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

  const cambiarVista = (nueva: Vista) => {
    setVista(nueva);
    setError("");
    setCode("");
  };

  const iniciarSesion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCargando(true);
    setError("");
    try {
      const { error: loginError } = await createSupabaseBrowserClient().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (loginError) throw loginError;
      router.replace(destinoDespuesDeEntrar());
    } catch (loginError) {
      console.error("No se pudo iniciar sesión:", loginError);
      setError("Correo o contraseña incorrectos. Si no recuerdas tu contraseña, entra con un código.");
    } finally {
      setCargando(false);
    }
  };

  const crearCuenta = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const { data, error: signUpError } = await createSupabaseBrowserClient().auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: nombre.trim(), marketing_opt_in: marketingOptIn } },
      });
      if (signUpError) throw signUpError;
      // Supabase no avisa si el correo ya tenía cuenta: devuelve un usuario sin identidades.
      if (data.user && data.user.identities?.length === 0) {
        setError("Ese correo ya tiene una cuenta. Inicia sesión o entra con un código.");
        return;
      }
      if (data.session) {
        router.replace(destinoDespuesDeEntrar());
        return;
      }
      // Hay que confirmar el correo: llega un código de 6 dígitos.
      setEsperaReenvio(30);
      setVista("codigo");
    } catch (signUpError) {
      console.error("No se pudo crear la cuenta:", signUpError);
      setError("No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const solicitarCodigo = async () => {
    setCargando(true);
    setError("");
    try {
      const { error: otpError } = await createSupabaseBrowserClient().auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true, data: { marketing_opt_in: marketingOptIn } },
      });
      if (otpError) throw otpError;
      setEsperaReenvio(30);
      setVista("codigo");
    } catch (sendError) {
      console.error("No se pudo enviar el código de acceso:", sendError);
      setError("No pudimos enviar el código. Revisa el correo e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const verificarCodigo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Escribe el código completo de 6 dígitos.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const { error: verifyError } = await createSupabaseBrowserClient().auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: "email",
      });
      if (verifyError) throw verifyError;
      if (olvido) {
        setPassword("");
        setVista("nuevaClave");
        return;
      }
      router.replace(destinoDespuesDeEntrar());
    } catch (verifyError) {
      console.error("No se pudo verificar el código:", verifyError);
      setError("El código no es válido o venció. Revísalo o solicita uno nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const guardarNuevaClave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const { error: updateError } = await createSupabaseBrowserClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace(destinoDespuesDeEntrar());
    } catch (updateError) {
      console.error("No se pudo guardar la nueva contraseña:", updateError);
      setError("No pudimos guardar la contraseña. Prueba con otra.");
    } finally {
      setCargando(false);
    }
  };

  const campoPassword = (autoComplete: string) => (
    <div className="account-pass">
      <input
        id="account-password"
        className="account-field"
        type={verPassword ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={6}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        disabled={cargando}
      />
      <button type="button" onClick={() => setVerPassword((v) => !v)} aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
        {verPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );

  const campoCorreo = (
    <>
      <label htmlFor="account-email">Correo electrónico</label>
      <input
        id="account-email"
        className="account-field"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        disabled={cargando}
      />
    </>
  );

  return (
    <main className="storefront account-page">
      <section className="account-card" aria-labelledby="account-title">
        <Link href="/" className="account-logo" aria-label="NAYA, volver al inicio">NAYA</Link>

        {(vista === "login" || vista === "registro") && (
          <>
            <h1 id="account-title" className="account-title-sm">{vista === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>
            <div className="account-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={vista === "login"} className={vista === "login" ? "account-tab account-tab--on" : "account-tab"} onClick={() => cambiarVista("login")}>
                Ya tengo cuenta
              </button>
              <button type="button" role="tab" aria-selected={vista === "registro"} className={vista === "registro" ? "account-tab account-tab--on" : "account-tab"} onClick={() => cambiarVista("registro")}>
                Crear cuenta
              </button>
            </div>
          </>
        )}

        {vista === "login" && (
          <form onSubmit={iniciarSesion} className="account-form">
            {campoCorreo}
            <label htmlFor="account-password">Contraseña</label>
            {campoPassword("current-password")}
            <button className="account-submit" type="submit" disabled={cargando}>
              {cargando ? "Entrando..." : "Iniciar sesión"} <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button type="button" className="account-link" onClick={() => { setOlvido(true); cambiarVista("pedirCodigo"); }}>
              ¿Olvidaste tu contraseña?
            </button>
            <button type="button" className="account-link" onClick={() => { setOlvido(false); cambiarVista("pedirCodigo"); }}>
              Entrar con un código a mi correo
            </button>
          </form>
        )}

        {vista === "registro" && (
          <form onSubmit={crearCuenta} className="account-form">
            <label htmlFor="account-name">Nombre</label>
            <input id="account-name" className="account-field" type="text" autoComplete="name" value={nombre} onChange={(event) => setNombre(event.target.value)} required disabled={cargando} />
            {campoCorreo}
            <label htmlFor="account-password">Contraseña <small>(mínimo 6 caracteres)</small></label>
            {campoPassword("new-password")}
            <label className="account-consent">
              <input type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} disabled={cargando} />
              <span>Quiero recibir novedades y ofertas por correo</span>
            </label>
            <button className="account-submit" type="submit" disabled={cargando}>
              {cargando ? "Creando cuenta..." : "Crear cuenta"} <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
        )}

        {vista === "pedirCodigo" && (
          <>
            <h1 id="account-title" className="account-title-sm">{olvido ? "Recuperar contraseña" : "Entrar con un código"}</h1>
            <p className="account-subtitle">{olvido ? "Te enviamos un código de 6 dígitos a tu correo y luego creas tu nueva contraseña." : "Te enviamos un código de 6 dígitos a tu correo para que entres sin contraseña."}</p>
            <form onSubmit={(event) => { event.preventDefault(); void solicitarCodigo(); }} className="account-form">
              {campoCorreo}
              <button className="account-submit" type="submit" disabled={cargando}>
                {cargando ? "Enviando..." : "Enviar código"} <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>
            <button type="button" className="account-back" onClick={() => cambiarVista("login")}>
              <ArrowLeft size={15} aria-hidden="true" /> Volver a iniciar sesión
            </button>
          </>
        )}

        {vista === "codigo" && (
          <>
            <div className="account-confirm-icon"><CheckCircle2 size={26} aria-hidden="true" /></div>
            <p className="account-eyebrow">REVISA TU CORREO</p>
            <h1 id="account-title">Ingresa tu código</h1>
            <p className="account-subtitle">Enviamos un código de 6 dígitos a <strong>{email.trim()}</strong>. Si no lo ves, revisa la carpeta de Spam o Promociones.</p>
            <form onSubmit={verificarCodigo} className="account-form">
              <label htmlFor="account-code">Código de verificación</label>
              <input
                id="account-code"
                className="account-code-input"
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
                {cargando ? "Verificando..." : "Verificar código"} <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>
            <button type="button" className="account-resend" onClick={() => void solicitarCodigo()} disabled={cargando || esperaReenvio > 0}>
              {esperaReenvio > 0 ? `Reenviar código en ${esperaReenvio}s` : "Reenviar código"}
            </button>
            <button type="button" className="account-back" onClick={() => cambiarVista("login")}>
              <ArrowLeft size={15} aria-hidden="true" /> Volver
            </button>
          </>
        )}

        {vista === "nuevaClave" && (
          <>
            <h1 id="account-title" className="account-title-sm">Crea tu nueva contraseña</h1>
            <p className="account-subtitle">Mínimo 6 caracteres. Usa el ojito para revisar lo que escribes.</p>
            <form onSubmit={guardarNuevaClave} className="account-form">
              <label htmlFor="account-password">Nueva contraseña</label>
              {campoPassword("new-password")}
              <button className="account-submit" type="submit" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar y entrar"} <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>
          </>
        )}

        {error && <p className="account-message account-message--error" role="alert">{error}</p>}
        <p className="account-legal">
          Al continuar, aceptas nuestros <Link href="/terminos">Términos y condiciones</Link> y nuestra{" "}
          <Link href="/privacidad">Política de privacidad</Link>.
        </p>
      </section>
    </main>
  );
}
