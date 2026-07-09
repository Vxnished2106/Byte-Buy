import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase-storage/supabase.service';

@Injectable()
export class SupabaseAuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Registra un nuevo usuario en el proveedor de autenticación (Supabase).
   * @param datos Correo, contraseña y metadatos del usuario.
   * @returns El id y correo del usuario creado en Supabase.
   * @throws BadRequestException si faltan datos o Supabase rechaza el registro.
   */
  async registrar(datos: {
    email: string;
    password: string;
    nombre?: string;
    apellido1?: string;
    apellido2?: string | null;
  }): Promise<{ id: string; email: string }> {
    if (!datos.email || !datos.password) {
      throw new BadRequestException('Correo y contraseña son requeridos');
    }

    const { data, error } =
      await this.supabaseService.client.auth.admin.createUser({
        email: datos.email,
        password: datos.password,
        email_confirm: true,
        user_metadata: {
          nombre: datos.nombre ?? '',
          apellido1: datos.apellido1 ?? '',
          apellido2: datos.apellido2 ?? null,
        },
      });

    if (error) throw new BadRequestException(error.message);
    if (!data?.user) throw new BadRequestException('No se pudo crear el usuario');

    return { id: data.user.id, email: data.user.email ?? datos.email };
  }

  async cambiarContrasena(supabaseId: string, contrasenaNueva: string): Promise<void> {
    if (!supabaseId) throw new BadRequestException('supabaseId requerido');

    const { error } = await this.supabaseService.client.auth.admin.updateUserById(
      supabaseId,
      { password: contrasenaNueva },
    );

    if (error) throw new BadRequestException(error.message);
  }

  async restablecerContrasena(email: string, redirectTo?: string): Promise<void> {
    if (!email) throw new BadRequestException('Email requerido');

    const { error } = await this.supabaseService.client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw new BadRequestException(error.message);
  }
}
