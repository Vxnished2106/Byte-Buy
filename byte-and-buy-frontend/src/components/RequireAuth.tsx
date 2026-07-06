import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useSesion } from "../hooks/useSesion";

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { session, loading } = useSesion();

  if (loading) return null;

  if (!session) {
    return fallback ? <>{fallback}</> : <Navigate to="/byte&buy/login" replace />;
  }

  return <>{children}</>;
}
