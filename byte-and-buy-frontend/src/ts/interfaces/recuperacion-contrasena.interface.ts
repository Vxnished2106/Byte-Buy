/** Datos enviados al backend para confirmar la recuperación de contraseña con el código recibido. */
export interface ConfirmarRecuperacionData {
  email: string;
  codigo: string;
  nuevaContrasena: string;
}
