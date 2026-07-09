import axios from "axios";
import api from "./api";
import type { CambiarContrasena, ConfirmarRecuperacionData } from "../ts/interfaces";

function errorDelBackend(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message;
    if (mensaje) return new Error(Array.isArray(mensaje) ? mensaje[0] : mensaje);
  }
  return new Error(fallback);
}

/** Cambia la contraseña del usuario autenticado, validando la contraseña actual. */
export async function cambiarContrasena(datos: CambiarContrasena): Promise<void> {
  try {
    await api.patch("/usuarios/cambiar-contrasena", datos);
  } catch (error) {
    throw errorDelBackend(error, "No se pudo cambiar la contraseña");
  }
}

/** Envía un código de recuperación (PIN, válido 15 min) al correo indicado. */
export async function solicitarRecuperacion(email: string): Promise<void> {
  try {
    await api.post("/usuarios/solicitar-recuperacion", { email });
  } catch (error) {
    throw errorDelBackend(error, "No se pudo enviar el código de recuperación");
  }
}

/** Valida el PIN de recuperación y establece la nueva contraseña. */
export async function confirmarRecuperacion(
  datos: ConfirmarRecuperacionData,
): Promise<void> {
  try {
    await api.post("/usuarios/confirmar-recuperacion", datos);
  } catch (error) {
    throw errorDelBackend(error, "No se pudo restablecer la contraseña");
  }
}
