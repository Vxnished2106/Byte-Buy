import type { Usuario } from "./usuario.interface";

/** Datos enviados al backend para registrar un nuevo usuario. */
export interface RegisterData {
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
  email: string;
  password: string;
}

/** Credenciales enviadas al backend para iniciar sesión. */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Resultado de un registro. `usuario` es `null` cuando el backend requiere
 * confirmación (p. ej. verificación de correo) antes de crear la sesión.
 */
export interface RegisterResult {
  usuario: Usuario | null;
  requiereConfirmacion: boolean;
}
