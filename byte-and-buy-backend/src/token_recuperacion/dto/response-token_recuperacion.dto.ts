/**
 * DTO para la respuesta de datos de token de recuperación.
 */
export class ResponseTokenRecuperacionDto {
  /** ID único del token. */
  id: number;
  /** ID del usuario. */
  usuario_id: number;
  /** Fecha y hora de expiración. */
  expira: Date;
  /** Fecha y hora de uso (null si no se ha usado). */
  usado_en: Date | null;
  /** Fecha y hora de registro. */
  registro: Date;
  /** PIN del token. */
  token: string;
}
