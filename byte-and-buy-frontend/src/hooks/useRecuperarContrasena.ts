import { useState } from "react";
import { solicitarRecuperacion, confirmarRecuperacion } from "../services/contrasena";

/**
 * Flujo de "olvidé mi contraseña" en dos pasos: envío del PIN por correo
 * (`solicitar`) y validación del PIN + nueva contraseña (`confirmar`).
 * `step` avanza solo cuando el paso anterior tuvo éxito en el backend.
 */
export function useRecuperarContrasena() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function solicitar(correo: string) {
    setLoading(true);
    setError("");
    try {
      await solicitarRecuperacion(correo);
      setEmail(correo);
      setStep(2);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo enviar el código",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function confirmar(codigo: string, nuevaContrasena: string) {
    setLoading(true);
    setError("");
    try {
      await confirmarRecuperacion({ email, codigo, nuevaContrasena });
      setStep(3);
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo restablecer la contraseña",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { step, email, loading, error, solicitar, confirmar };
}
