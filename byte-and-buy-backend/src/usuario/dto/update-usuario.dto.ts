import { Rol } from '../entities/usuario.entity';

export class UpdateUsuarioDto {
  usuario_nombre?: string;
  usuario_apellido1?: string;
  usuario_apellido2?: string | null;
  usuario_correo?: string;
  usuario_rol?: Rol;
  usuario_foto?: string | null;
}
