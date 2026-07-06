export const Rol = {
  CLIENTE: "cliente",
  ADMIN: "admin",
} as const;

export type Rol = (typeof Rol)[keyof typeof Rol];

export interface Usuario {
  usuario_id: number;
  usuario_nombre: string;
  usuario_apellido1: string;
  usuario_apellido2?: string | null;
  usuario_correo: string;
  usuario_rol: Rol;
  supabase_id?: string | null;
  usuario_foto?: string | null;
}

export interface UpdateUsuario {
  usuario_nombre?: string;
  usuario_apellido1?: string;
  usuario_apellido2?: string | null;
  usuario_correo?: string;
  usuario_rol?: Rol;
  usuario_foto?: string | null;
}

export interface CambiarContrasena {
  contrasena_actual: string;
  contrasena_nueva: string;
}
