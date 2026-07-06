import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";

export function useSesion() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
