import { IsOptional, IsString, IsEmail, Length, IsEnum } from 'class-validator';
import { Rol } from '../entities/usuario.entity';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  usuario_nombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  usuario_apellido1?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  usuario_apellido2?: string | null;

  @IsOptional()
  @IsEmail()
  usuario_correo?: string;

  @IsOptional()
  @IsEnum(Rol)
  usuario_rol?: Rol;

  @IsOptional()
  @IsString()
  usuario_foto?: string | null;
}
