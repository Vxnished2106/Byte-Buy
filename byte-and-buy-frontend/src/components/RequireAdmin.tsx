import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useUsuario } from "../hooks/useUsuario";
import { Rol } from "../ts/interfaces";

interface RequireAdminProps {
  children: ReactNode;
}

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
