import { Controller, Get, Post, Param, Body, ParseIntPipe, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { EtiquetaService } from './etiqueta.service';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { ResponseEtiquetaDto } from './dto/response-etiqueta.dto';
import { AsignarEtiquetaDto } from './dto/asignar-etiqueta.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { UsuarioService } from '../usuario/usuario.service';
import { Rol } from '../usuario/entities/usuario.entity';

/**
 * Controlador de etiquetas.
 * Maneja las rutas relacionadas con la gestión de etiquetas de productos.
 */
@Controller('etiquetas')
export class EtiquetaController {
  constructor(
    private readonly etiquetaService: EtiquetaService,
    private readonly usuarioService: UsuarioService,
  ) { }

  /**
   * Valida que el usuario autenticado tenga rol de administrador.
   * @param req Request con el usuario autenticado.
   * @throws ForbiddenException Si el usuario no es administrador.
   */
  private async validarAdmin(req: any): Promise<void> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);

    if (usuario.usuario_rol !== Rol.ADMIN) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta acción',
      );
    }
  }

  /**
   * Obtiene todas las etiquetas.
   * @returns Lista de etiquetas.
   */
  @Get()
  async mostrarEtiquetas(): Promise<ResponseEtiquetaDto[]> {
    return this.etiquetaService.mostrarEtiquetas();
  }

  /**
   * Registra una nueva etiqueta (solo para administradores).
   * @param req Request con el usuario autenticado.
   * @param datos Datos de la etiqueta.
   * @returns Etiqueta registrada.
   */
  @UseGuards(SupabaseAuthGuard)
  @Post('registrar')
  async registrarEtiqueta(
    @Request() req: any,
    @Body() datos: CreateEtiquetaDto): Promise<ResponseEtiquetaDto> {
    await this.validarAdmin(req);
    return this.etiquetaService.registrarEtiqueta(datos);
  }
}
