import { useState } from "react";
import { cambiarContrasena } from "../services/contrasena";

/**
 * Cambia la contraseña del usuario autenticado (requiere la contraseña
 * actual). Expone estado de carga, error y éxito para la pantalla.
 */
export function useCambiarContrasena() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function cambiar(contrasenaActual: string, contrasenaNueva: string) {
    setLoading(true);
    setError("");
    try {
      await cambiarContrasena({
        contrasena_actual: contrasenaActual,
        contrasena_nueva: contrasenaNueva,
      });
      setSuccess(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cambiar la contraseña",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { cambiar, loading, error, success };
}
