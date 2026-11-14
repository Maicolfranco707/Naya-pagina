"use client";

import { type FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";

type AccountTab = "login" | "register";

export default function CuentaPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AccountTab>("login");
  const [user, setUser] = useState<User | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;
    let unsubscribe = () => {};

    const comprobarSesion = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (activo) setUser(session?.user ?? null);
        });
        unsubscribe = () => authListener.subscription.unsubscribe();

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (activo) setUser(data.session?.user ?? null);
      } catch (sessionError) {
        console.error("No se pudo comprobar la sesión de la cuenta:", sessionError);
        if (activo) setError("No pudimos comprobar tu sesión. Intenta de nuevo.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    void comprobarSesion();
    return () => {
      activo = false;
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnviando(true);
    setError("");
    setAviso("");

    try {
      const supabase = createSupabaseBrowserClient();
      if (tab === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: nombre.trim(),
              phone: telefono.trim(),
            },
          },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          setUser(data.user);
          router.refresh();
        } else {
          setAviso("Revisa tu correo para confirmar la creación de tu cuenta.");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        setUser(data.user);
        router.refresh();
      }
    } catch (authError) {
      console.error("No se pudo completar la autenticación del cliente:", authError);
      setError(
        tab === "register"
          ? "No se pudo crear la cuenta. Verifica los datos e inténtalo de nuevo."
          : "No se pudo iniciar sesión. Revisa tu correo y contraseña."
      );
    } finally {
      setEnviando(false);
    }
  };

  const cerrarSesion = async () => {
    setError("");
    try {
      const { error: signOutError } = await createSupabaseBrowserClient().auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
      setPassword("");
    } catch (signOutError) {
      console.error("No se pudo cerrar la sesión de la cuenta:", signOutError);
      setError("No se pudo cerrar la sesión. Intenta de nuevo.");
    }
  };

  const nombreCliente = user?.user_metadata?.full_name;

  if (cargando) {
    return (
      <main className="storefront account-page">
        <p className="account-loading" role="status">Comprobando tu sesión...</p>
      </main>
    );
  }

  return (
    <main className="storefront account-page">
      <section className="account-card" aria-labelledby="account-title">
        <Link href="/" className="account-logo" aria-label="NAYA, volver al inicio">NAYA</Link>
        <p className="account-eyebrow">TU ESPACIO NAYA</p>

        {user ? (
          <>
            <h1 id="account-title">Mi cuenta</h1>
            <p className="account-subtitle">
              Hola{typeof nombreCliente === "string" && nombreCliente ? `, ${nombreCliente}` : ""}. Has iniciado sesión con{" "}
              <strong>{user.email}</strong>
            </p>
            <div className="account-orders-note">Pronto podrás ver tus pedidos aquí</div>
            <button type="button" className="primary-action account-submit" onClick={() => void cerrarSesion()}>
              Cerrar sesión
            </button>
            <Link href="/" className="account-home-link secondary-action">Volver a la tienda</Link>
          </>
        ) : (
          <>
            <h1 id="account-title">{tab === "login" ? "Bienvenida de nuevo" : "Crear cuenta"}</h1>
            <p className="account-subtitle">
              {tab === "login" ? "Inicia sesión para continuar con NAYA." : "Crea tu cuenta para agilizar tus próximos pedidos."}
            </p>

            <div className="account-tabs" role="tablist" aria-label="Acceso a tu cuenta">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "login"}
                className={tab === "login" ? "primary-action account-tab" : "secondary-action account-tab"}
                onClick={() => { setTab("login"); setError(""); setAviso(""); }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "register"}
                className={tab === "register" ? "primary-action account-tab" : "secondary-action account-tab"}
                onClick={() => { setTab("register"); setError(""); setAviso(""); }}
              >
                Crear cuenta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="account-form">
              {tab === "register" && (
                <>
                  <label htmlFor="account-name">Nombre completo</label>
                  <input
                    id="account-name"
                    className="account-field"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    required
                    disabled={enviando}
                  />
                  <label htmlFor="account-phone">Teléfono</label>
                  <input
                    id="account-phone"
                    className="account-field"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                    required
                    disabled={enviando}
                  />
                </>
              )}
              <label htmlFor="account-email">Correo electrónico</label>
              <input
                id="account-email"
                className="account-field"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={enviando}
              />
              <label htmlFor="account-password">Contraseña</label>
              <input
                id="account-password"
                className="account-field"
                name="password"
                type="password"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={enviando}
              />
              <button type="submit" className="primary-action account-submit" disabled={enviando}>
                {enviando ? "Procesando..." : tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            </form>

            {aviso && <p className="account-message account-message--success" role="status">{aviso}</p>}
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
