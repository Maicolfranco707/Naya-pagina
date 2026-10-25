"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";

export default function CuentaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [comprobandoSesion, setComprobandoSesion] = useState(true);

  useEffect(() => {
    let activo = true;
    let subscription: { unsubscribe: () => void } | undefined;

    const comprobarSesion = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!activo) return;
        if (!data.user) {
          router.replace("/cuenta/ingresar");
          return;
        }
        setEmail(data.user.email ?? "");

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!session) router.replace("/cuenta/ingresar");
        });
        subscription = authListener.subscription;
      } catch (error) {
        console.error("No se pudo comprobar la sesión de la cuenta:", error);
        if (activo) router.replace("/cuenta/ingresar");
      } finally {
        if (activo) setComprobandoSesion(false);
      }
    };

    void comprobarSesion();
    return () => {
      activo = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  if (comprobandoSesion || !email) {
    return (
      <main className="storefront account-page">
        <p className="account-loading" role="status">Comprobando tu sesión...</p>
      </main>
    );
  }

  return (
    <main className="storefront account-page">
      <section className="account-card account-card--profile">
        <Link href="/" className="account-logo" aria-label="NAYA, volver al inicio">NAYA</Link>
        <p className="account-eyebrow">TU ESPACIO NAYA</p>
        <h1>Mi cuenta</h1>
        <p className="account-subtitle">Has iniciado sesión con <strong>{email}</strong></p>
        <div className="account-orders-note">Pronto podrás ver tus pedidos aquí</div>
        <Link href="/" className="account-home-link">Volver a la tienda</Link>
      </section>
    </main>
  );
}
