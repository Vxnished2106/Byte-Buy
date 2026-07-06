import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  /**
   * GET /usuarios/me
   * Es para registrar al usuario cuando se haya creado en supabase
   * Headers: Authorization: Bearer <token_supabase>
   * Body: ninguno
   */
  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Request() req: any): Promise<ResponseUsuarioDto> {
    return this.usuarioService.getOrCreateFromToken(req.user);
  }

  @Get(':id')
  async getUsuario(@Param('id', ParseIntPipe) id: number): Promise<ResponseUsuarioDto> {
    return this.usuarioService.findOne(id);
  }

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
   * Permite enviar al correo que se ingreso el pin
   * Body: { "email": "juan@example.com" }
   */
  @Post('solicitar-recuperacion')
  async solicitarRecuperacion(@Body() body: { email: string }): Promise<void> {
    return this.usuarioService.solicitarRecuperacion(body.email);
  }

  /**
   * POST /usuarios/confirmar-recuperacion
   * Cambia la contraseña al validar el pin buscando por el email
   * Body: { "email": "juan@example.com", "codigo": "123456", "nuevaContrasena": "nueva123" }
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
