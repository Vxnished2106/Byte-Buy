import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * Controlador de usuarios.
 * Maneja las rutas relacionadas con la gestión de usuarios, perfil y recuperación de contraseña.
 */
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  /**
   * GET /usuarios/me
   * Obtiene o crea el usuario a partir del token de Supabase.
   * @param req Request con el usuario autenticado.
   * @returns Datos del usuario.
   */
  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Request() req: any): Promise<ResponseUsuarioDto> {
    return this.usuarioService.getOrCreateFromToken(req.user);
  }

  /**
   * GET /usuarios/perfil
   * Obtiene el perfil del usuario autenticado.
   * @param req Request con el usuario autenticado.
   * @returns Datos del perfil del usuario.
   */
  @UseGuards(SupabaseAuthGuard)
  @Get('perfil')
  async getPerfil(@Request() req: any): Promise<ResponseUsuarioDto> {
    return this.usuarioService.getOrCreateFromToken(req.user);
  }

  /**
   * GET /usuarios/:id
   * Obtiene un usuario por su ID.
   * @param id ID del usuario.
   * @returns Datos del usuario.
   */
  @Get(':id')
  async getUsuario(@Param('id', ParseIntPipe) id: number): Promise<ResponseUsuarioDto> {
    return this.usuarioService.findOne(id);
  }

  /**
   * PATCH /usuarios
   * Actualiza la información del usuario autenticado.
   * @param req Request con el usuario autenticado.
   * @param datos Nuevos datos del usuario.
   * @param file Foto de perfil (opcional).
   * @returns Usuario actualizado.
   */
  @UseGuards(SupabaseAuthGuard)
  @Patch()
  @UseInterceptors(FileInterceptor('usuario_foto'))
  async update(
    @Request() req: any,
    @Body() datos: UpdateUsuarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return this.usuarioService.update(usuario.usuario_id, datos, file);
  }

  /**
   * GET /usuarios/perfil
   * Obtiene el perfil del usuario autenticado (alias de getPerfil).
   * @param req Request con el usuario autenticado.
   * @returns Datos del perfil del usuario.
   */
  @UseGuards(SupabaseAuthGuard)
  @Get('perfil')
  async obtenerPerfil(@Request() req: any): Promise<ResponseUsuarioDto> {
    return this.usuarioService.obtenerPerfilAutenticado(req.user);
  }

  /**
   * PATCH /usuarios/perfil
   * Actualiza el perfil del usuario autenticado (alias de update).
   * @param req Request con el usuario autenticado.
   * @param datos Nuevos datos del usuario.
   * @param file Foto de perfil (opcional).
   * @returns Usuario actualizado.
   */
  @UseGuards(SupabaseAuthGuard)
  @Patch('perfil')
  @UseInterceptors(FileInterceptor('usuario_foto'))
  async actualizarPerfil(
    @Request() req: any,
    @Body() datos: UpdateUsuarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseUsuarioDto> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return this.usuarioService.update(usuario.usuario_id, datos, file);
  }

  /**
   * PATCH /usuarios/cambiar-contrasena
   * Cambia la contraseña del usuario autenticado.
   * @param req Request con el usuario autenticado.
   * @param datos Contraseña actual y nueva.
   */
  @UseGuards(SupabaseAuthGuard)
  @Patch('cambiar-contrasena')
  async cambiarContrasena(
    @Request() req: any,
    @Body() datos: { contrasena_actual: string; contrasena_nueva: string },
  ): Promise<void> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return this.usuarioService.cambiarContrasena(usuario.usuario_id, datos.contrasena_actual, datos.contrasena_nueva);
  }

  /**
   * POST /usuarios/solicitar-recuperacion
   * Envía un PIN de recuperación de contraseña al correo del usuario.
   * @param body Correo electrónico del usuario.
   */
  @Post('solicitar-recuperacion')
  async solicitarRecuperacion(@Body() body: { email: string }): Promise<void> {
    return this.usuarioService.solicitarRecuperacion(body.email);
  }

  /**
   * POST /usuarios/confirmar-recuperacion
   * Valida el PIN y cambia la contraseña del usuario.
   * @param body Correo, PIN y nueva contraseña.
   */
  @Post('confirmar-recuperacion')
  async confirmarRecuperacion(
    @Body() body: { email: string; codigo: string; nuevaContrasena: string },
  ): Promise<void> {
    return this.usuarioService.confirmarRecuperacion(
      body.email,
      body.codigo,
      body.nuevaContrasena,
    );
  }
}
