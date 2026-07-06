import { Rol } from '../entities/usuario.entity';

export class ResponseUsuarioDto {
  usuario_id: number;
  usuario_nombre: string;
  usuario_apellido1: string;
  usuario_apellido2?: string | null;
  usuario_correo: string;
  usuario_rol: Rol;
  supabase_id?: string | null;
  usuario_foto?: string | null;
}
