/**
 * DTO para el registro de un nuevo usuario.
 */
export class RegistroDto {
  /** Nombre del usuario */
  usuario_nombre!: string;
  /** Primer apellido del usuario */
  usuario_apellido1!: string;
  /** Segundo apellido del usuario (opcional) */
  usuario_apellido2?: string | null;
  /** Correo electrónico del usuario */
  usuario_correo!: string;
  /** Contraseña del usuario */
  usuario_contrasena!: string;
}

