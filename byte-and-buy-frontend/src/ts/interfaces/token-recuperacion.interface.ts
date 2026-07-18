/** Forma que entrega el backend para un token de recuperación de contraseña. */
export interface TokenRecuperacion {
  id: number;
  usuario_id: number;
  intentos: number;
  token: string;
  expira: string;
  usado_en: string | null;
  registro: string;
}
