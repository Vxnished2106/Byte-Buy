import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";

/**
 * Expone la sesión activa de Supabase y la mantiene sincronizada en tiempo
 * real (login, logout, refresh de token) mediante `onAuthStateChange`.
 * `loading` es `true` hasta que se resuelve la sesión inicial.
 */
export function useSesion() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Evita actualizar el estado si el componente ya se desmontó
    // (por ejemplo, si la petición inicial resuelve tarde).
    let vigente = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!vigente) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nuevaSesion) => {
        if (!vigente) return;
        setSession(nuevaSesion);
        setLoading(false);
      },
    );

    return () => {
      vigente = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
