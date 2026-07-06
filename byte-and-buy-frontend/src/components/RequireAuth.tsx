import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nuevaSesion) => {
        setSession(nuevaSesion);
        setLoading(false);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!session) {
    return fallback ? <>{fallback}</> : <Navigate to="/byte&buy/login" replace />;
  }

  return <>{children}</>;
}
