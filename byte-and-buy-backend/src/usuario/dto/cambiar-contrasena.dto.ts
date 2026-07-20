/**
 * DTO para cambiar la contraseña de un usuario.
 */
export class CambiarContrasenaDto {
  /** ID del usuario. */
  usuario_id: number;
  /** Contraseña actual del usuario. */
  contrasena_actual: string;
  /** Nueva contraseña del usuario. */
  contrasena_nueva: string;
}
