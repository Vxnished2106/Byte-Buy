import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { ResponsePagoDto } from './dto/response-pago.dto';
import { PagoValidacionService } from './pago-validacion.service';
import { ValidarPagoDto } from './dto/validar-pago.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

@Controller('pagos')
@UseGuards(SupabaseAuthGuard)
export class PagoController {
  constructor(
    private readonly pagoValidacionService: PagoValidacionService,
    private readonly pagoService: PagoService
  ) { }

  @Post('validar')
  validar(@Body() dto: ValidarPagoDto) {
    return this.pagoValidacionService.validar(dto);
  }

  @Post('registrar')
  async registrarPago(@Body() datos: CreatePagoDto): Promise<ResponsePagoDto> {
    return this.pagoService.registrarPago(datos);
  }

  @Get(':pago_id')
  async findOne(@Param('pago_id', ParseIntPipe) pago_id: number): Promise<ResponsePagoDto> {
    return this.pagoService.findOne(pago_id);
  }

  @Get('venta/:venta_id')
  async findByVenta(@Param('venta_id', ParseIntPipe) venta_id: number): Promise<ResponsePagoDto[]> {
    return this.pagoService.findByVenta(venta_id);
  }

  @Patch(':pago_id')
  async update(
    @Param('pago_id', ParseIntPipe) pago_id: number,
    @Body() datos: UpdatePagoDto,
  ): Promise<ResponsePagoDto> {
    return this.pagoService.update(pago_id, datos);
  }
}
