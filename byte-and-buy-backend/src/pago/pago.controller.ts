import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { ResponsePagoDto } from './dto/response-pago.dto';
import { PagoValidacionService } from './pago-validacion.service';
import { ValidarPagoDto } from './dto/validar-pago.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

/**
 * Controlador de pagos.
 * Maneja las rutas relacionadas con la validación y el registro de pagos.
 */
@Controller('pagos')
@UseGuards(SupabaseAuthGuard)
export class PagoController {
  constructor(
    private readonly pagoValidacionService: PagoValidacionService,
    private readonly pagoService: PagoService
  ) { }

  /**
   * Valida los datos de un método de pago (tarjeta) sin procesar el cobro.
   * @param dto Datos de la tarjeta a validar.
   * @returns Resultado de la validación.
   */
  @Post('validar')
  validar(@Body() dto: ValidarPagoDto) {
    return this.pagoValidacionService.validar(dto);
  }

  /**
   * Registra un nuevo pago para una venta.
   * @param datos Datos del pago.
   * @returns Pago registrado.
   */
  @Post('registrar')
  async registrarPago(@Body() datos: CreatePagoDto): Promise<ResponsePagoDto> {
    return this.pagoService.registrarPago(datos);
  }

  /**
   * Obtiene un pago por su ID.
   * @param pago_id ID del pago.
   * @returns DTO del pago.
   */
  @Get(':pago_id')
  async findOne(@Param('pago_id', ParseIntPipe) pago_id: number): Promise<ResponsePagoDto> {
    return this.pagoService.findOne(pago_id);
  }

  /**
   * Obtiene todos los pagos asociados a una venta.
   * @param venta_id ID de la venta.
   * @returns Lista de pagos de la venta.
   */
  @Get('venta/:venta_id')
  async findByVenta(@Param('venta_id', ParseIntPipe) venta_id: number): Promise<ResponsePagoDto[]> {
    return this.pagoService.findByVenta(venta_id);
  }

  /**
   * Actualiza un pago existente.
   * @param pago_id ID del pago.
   * @param datos Nuevos datos del pago.
   * @returns Pago actualizado.
   */
  @Patch(':pago_id')
  async update(
    @Param('pago_id', ParseIntPipe) pago_id: number,
    @Body() datos: UpdatePagoDto,
  ): Promise<ResponsePagoDto> {
    return this.pagoService.update(pago_id, datos);
  }
}
