import {
  Controller,
  Post,
  Body,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseAuthService } from './supabase-auth/auth-password.service';
import { UsuarioService } from '../usuario/usuario.service';
import { RegistroDto } from './dto/registro.dto';
import { ResponseUsuarioDto } from '../usuario/dto/response-usuario.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly usuarioService: UsuarioService,
  ) {}

  /**
   * POST /auth/registro
   * Registra un usuario nuevo: lo crea en Supabase (auth) y en la base local.
   * Body: { usuario_nombre, usuario_apellido1, usuario_apellido2?, usuario_correo, usuario_contrasena }
   */
  @Post('registro')
  async registro(@Body() datos: RegistroDto): Promise<ResponseUsuarioDto> {
    if (!datos?.usuario_correo || !datos?.usuario_contrasena) {
      throw new BadRequestException('Correo y contraseña son requeridos');
    }
    if (!datos.usuario_nombre || !datos.usuario_apellido1) {
      throw new BadRequestException('Nombre y primer apellido son requeridos');
    }

    // Evitar duplicados en la base local antes de tocar Supabase.
    const existente = await this.usuarioService.findByCorreo(datos.usuario_correo);
    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    // 1. Crear el usuario en el proveedor de autenticación (Supabase).
    const supabaseUser = await this.supabaseAuthService.registrar({
      email: datos.usuario_correo,
      password: datos.usuario_contrasena,
      nombre: datos.usuario_nombre,
      apellido1: datos.usuario_apellido1,
      apellido2: datos.usuario_apellido2 ?? null,
    });

    // 2. Crear el registro local vinculado al usuario de Supabase.
    return this.usuarioService.createFromSupabase({
      email: supabaseUser.email,
      userId: supabaseUser.id,
      nombre: datos.usuario_nombre,
      apellido1: datos.usuario_apellido1,
      apellido2: datos.usuario_apellido2 ?? undefined,
    });
  }
}
