import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FacturaService } from './factura.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { ResponseFacturaDto } from './dto/response-factura.dto';

/**
 * Controlador de facturas.
 * Maneja las rutas relacionadas con la generación, consulta, actualización y envío de facturas.
 */
@Controller('facturas')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  /**
   * POST /facturas
   * Genera una nueva factura para una venta.
   * @param datos Información necesaria para generar la factura.
   * @returns Factura generada.
   */
  @UseGuards(SupabaseAuthGuard)
  @Post()
  async generarFactura(
    @Body() datos: CreateFacturaDto,
  ): Promise<ResponseFacturaDto> {
    return this.facturaService.generarFactura(datos);
  }

  /**
   * POST /facturas/:id/enviar
   * Genera el PDF y envía la factura al correo del cliente.
   * @param id ID de la factura.
   * @returns Factura actualizada.
   */
  @UseGuards(SupabaseAuthGuard)
  @Post(':id/enviar')
  async enviarFactura(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseFacturaDto> {
    return this.facturaService.enviarFactura(id);
  }

  /**
   * GET /facturas/:id
   * Obtiene una factura por su ID.
   * @param id ID de la factura.
   * @returns Información de la factura.
   */
  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseFacturaDto> {
    return this.facturaService.findOne(id);
  }

  /**
   * GET /facturas/venta/:ventaId
   * Obtiene las facturas asociadas a una venta.
   * @param ventaId ID de la venta.
   * @returns Lista de facturas.
   */
  @UseGuards(SupabaseAuthGuard)
  @Get('venta/:ventaId')
  async findByVenta(
    @Param('ventaId', ParseIntPipe) ventaId: number,
  ): Promise<ResponseFacturaDto[]> {
    return this.facturaService.findByVenta(ventaId);
  }

  /**
   * PATCH /facturas/:id
   * Actualiza la información de una factura.
   * @param id ID de la factura.
   * @param datos Datos a actualizar.
   * @returns Factura actualizada.
   */
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateFacturaDto,
  ): Promise<ResponseFacturaDto> {
    return this.facturaService.update(id, datos);
  }
}