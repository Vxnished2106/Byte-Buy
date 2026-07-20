import axios from "axios";

/**
 * Extrae el mensaje de validación que manda el backend (NestJS) en
 * `error.response.data.message`, que puede venir como string o como
 * array de strings (errores de class-validator). Si no hay mensaje
 * legible (red caída, 500 sin body, etc.) usa `fallback`.
 *
 * No se usa en todos los services, solo donde el mensaje del backend es
 * información que el usuario necesita ver (validaciones de negocio en
 * carrito, pago, metodoPago, venta y contrasena: tarjeta inválida, stock
 * insuficiente, contraseña incorrecta, etc.). En services como `producto.ts`
 * o `usuario.ts` el error se deja propagar tal cual, porque a quien los
 * consume le alcanza con saber que la operación falló (ej. un toast
 * genérico), sin necesitar el detalle exacto que devolvió el backend.
 */
export function errorDelBackend(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message;
    if (mensaje) return new Error(Array.isArray(mensaje) ? mensaje[0] : mensaje);
  }
  return new Error(fallback);
}
