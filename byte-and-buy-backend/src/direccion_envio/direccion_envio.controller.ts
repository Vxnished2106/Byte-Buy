import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DireccionEnvioService } from './direccion_envio.service';
import { CreateDireccionEnvioDto } from './dto/create-direccion_envio.dto';
import { ResponseDireccionEnvioDto } from './dto/response-direccion_envio.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

/**
 * Controlador de direcciones de envío.
 * Maneja el registro y la consulta de direcciones del usuario autenticado.
 */
@Controller('direcciones-envio')
@UseGuards(SupabaseAuthGuard)
export class DireccionEnvioController {
  constructor(
    private readonly direccionEnvioService: DireccionEnvioService,
    private readonly usuarioService: UsuarioService,
  ) {}

  /**
   * Registra una nueva dirección de envío para el usuario autenticado.
   * @param req Request con el usuario autenticado.
   * @param datos Datos de la dirección.
   * @returns Dirección registrada.
   */
  @Post()
  async create(
    @Request() req: any,
    @Body() datos: CreateDireccionEnvioDto,
  ): Promise<ResponseDireccionEnvioDto> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return this.direccionEnvioService.create({
      ...datos,
      usuario_id: usuario.usuario_id,
    });
  }

  /**
   * Obtiene las direcciones de envío del usuario autenticado.
   * @param req Request con el usuario autenticado.
   * @returns Lista de direcciones del usuario.
   */
  @Get()
  async findMisDirecciones(
    @Request() req: any,
  ): Promise<ResponseDireccionEnvioDto[]> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return this.direccionEnvioService.findByUsuario(usuario.usuario_id);
  }
}
