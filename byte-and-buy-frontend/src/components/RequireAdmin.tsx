import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useUsuario } from "../hooks/useUsuario";
import { Rol } from "../ts/interfaces";

/**
 * Props para el componente RequireAdmin.
 */
interface RequireAdminProps {
  /** Componente a renderizar si el usuario es administrador. */
  children: ReactNode;
}

/**
 * Componente de protección de rutas que requieren rol de administrador.
 * Si el usuario no es admin, redirige a la página principal.
 */
export default function RequireAdmin({ children }: RequireAdminProps) {
  const { usuario, loading } = useUsuario();

  if (loading) return null;

  if (!usuario) {
    return <Navigate to="/byte&buy/login" replace />;
  }

  if (usuario.usuario_rol !== Rol.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
