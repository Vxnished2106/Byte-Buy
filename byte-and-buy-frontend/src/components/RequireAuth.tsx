import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useSesion } from "../hooks/useSesion";

/**
 * Props para el componente RequireAuth.
 */
interface RequireAuthProps {
  /** Componente a renderizar si el usuario está autenticado. */
  children: ReactNode;
  /** Componente a renderizar si el usuario no está autenticado (opcional). */
  fallback?: ReactNode;
}

/**
 * Componente de protección de rutas que requieren autenticación.
 * Si el usuario no está autenticado, redirige a login o muestra el fallback.
 */
export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { session, loading } = useSesion();

  if (loading) return null;

  if (!session) {
    return fallback ? <>{fallback}</> : <Navigate to="/byte&buy/login" replace />;
  }

  return <>{children}</>;
}
