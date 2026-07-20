import { IsOptional, IsString, IsEmail, Length, IsEnum } from 'class-validator';
import { Rol } from '../entities/usuario.entity';

/**
 * DTO para la actualización de datos de usuario.
 */
export class UpdateUsuarioDto {
  /** Nombre del usuario (opcional). */
  @IsOptional()
  @IsString()
  @Length(1, 100)
  usuario_nombre?: string;

  /** Primer apellido del usuario (opcional). */
  @IsOptional()
  @IsString()
  @Length(1, 100)
  usuario_apellido1?: string;

  /** Segundo apellido del usuario (opcional). */
  @IsOptional()
  @IsString()
  @Length(0, 100)
  usuario_apellido2?: string | null;

  /** Correo electrónico del usuario (opcional). */
  @IsOptional()
  @IsEmail()
  usuario_correo?: string;

  /** Rol del usuario (opcional). */
  @IsOptional()
  @IsEnum(Rol)
  usuario_rol?: Rol;

  /** URL de la foto de perfil (opcional). */
  @IsOptional()
  @IsString()
  usuario_foto?: string | null;
}
