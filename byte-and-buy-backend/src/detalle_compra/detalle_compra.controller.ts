import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DetalleCompraService } from './detalle_compra.service';
import { CreateDetalleCompraDto } from './dto/create-detalle_compra.dto';
import { ResponseDetalleCompraDto } from './dto/response-detalle_compra.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

/**
 * Controlador de detalles de compra.
 * Maneja las rutas relacionadas con el registro y consulta de los detalles de una compra.
 */
@Controller('detalle-compra')
export class DetalleCompraController {
  constructor(
    private readonly detalleCompraService: DetalleCompraService,
  ) {}

  /**
   * POST /detalle-compra
   * Registra un nuevo detalle de compra.
   * @param datos Información del detalle de compra.
   * @returns Detalle de compra registrado.
   */
  @UseGuards(SupabaseAuthGuard)
  @Post()
  async registrarDetalleCompra(
    @Body() datos: CreateDetalleCompraDto,
  ): Promise<ResponseDetalleCompraDto> {
    return this.detalleCompraService.registrarDetalleCompra(datos);
  }

  /**
   * GET /detalle-compra/:id
   * Obtiene un detalle de compra por su ID.
   * @param id ID del detalle de compra.
   * @returns Información del detalle de compra.
   */
  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  async mostrarDetalle(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDetalleCompraDto> {
    return this.detalleCompraService.mostrarDetalle(id);
  }

  /**
   * GET /detalle-compra/venta/:ventaId
   * Obtiene todos los detalles asociados a una venta.
   * @param ventaId ID de la venta.
   * @returns Lista de detalles de la venta.
   */
  @UseGuards(SupabaseAuthGuard)
  @Get('venta/:ventaId')
  async findByVenta(
    @Param('ventaId', ParseIntPipe) ventaId: number,
  ): Promise<ResponseDetalleCompraDto[]> {
    return this.detalleCompraService.findByVenta(ventaId);
  }
}