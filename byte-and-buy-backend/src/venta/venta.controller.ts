import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ResponseVentaDto } from './dto/response-venta.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

/**
 * Controlador de ventas.
 * Maneja las rutas relacionadas con el registro y la consulta de ventas.
 */
@Controller('ventas')
@UseGuards(SupabaseAuthGuard)
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
    private readonly usuarioService: UsuarioService
  ) { }

  /**
   * Registra una nueva venta para el usuario autenticado.
   * @param req Request con el usuario autenticado.
   * @param datos Datos de la venta.
   * @returns Venta registrada.
   */
  @Post('registrar')
  async registrarVenta(@Request() req: any, @Body() datos: CreateVentaDto): Promise<ResponseVentaDto> {

    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return this.ventaService.registrarVenta({ ...datos, usuario_id: usuario.usuario_id });

  }

  /**
   * Obtiene una venta por su ID.
   * @param venta_id ID de la venta.
   * @returns DTO de la venta.
   */
  @Get(':venta_id')
  async findOne(@Param('venta_id', ParseIntPipe) venta_id: number): Promise<ResponseVentaDto> {
    return this.ventaService.findOne(venta_id);
  }

  /**
   * Obtiene todas las ventas del usuario autenticado.
   * @param req Request con el usuario autenticado.
   * @returns Lista de ventas del usuario.
   */
  @Get('usuario/mis-ventas')
  async findByUsuario(@Request() req: any): Promise<ResponseVentaDto[]> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return this.ventaService.findByUsuario(usuario.usuario_id);
  }

  /**
   * Actualiza una venta existente.
   * @param venta_id ID de la venta.
   * @param datos Nuevos datos de la venta.
   * @returns Venta actualizada.
   */
  @Patch(':venta_id')
  async update(
    @Param('venta_id', ParseIntPipe) venta_id: number,
    @Body() datos: UpdateVentaDto,
  ): Promise<ResponseVentaDto> {
    return this.ventaService.update(venta_id, datos);
  }
}
