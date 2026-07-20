import { Rol } from '../entities/usuario.entity';

/**
 * DTO para la respuesta de datos de usuario.
 */
export class ResponseUsuarioDto {
  /** ID único del usuario. */
  usuario_id: number;
  /** Nombre del usuario. */
  usuario_nombre: string;
  /** Primer apellido del usuario. */
  usuario_apellido1: string;
  /** Segundo apellido del usuario (opcional). */
  usuario_apellido2?: string | null;
  /** Correo electrónico del usuario. */
  usuario_correo: string;
  /** Rol del usuario. */
  usuario_rol: Rol;
  /** ID del usuario en Supabase (opcional). */
  supabase_id?: string | null;
  /** URL de la foto de perfil (opcional). */
  usuario_foto?: string | null;
}
