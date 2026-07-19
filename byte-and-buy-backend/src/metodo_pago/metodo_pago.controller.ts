import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MetodoPagoService } from './metodo_pago.service';
import { CreateMetodoPagoDto } from './dto/create-metodo_pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo_pago.dto';
import { ResponseMetodoPagoDto } from './dto/response-metodo_pago.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

@Controller('metodos-pago')
@UseGuards(SupabaseAuthGuard)
export class MetodoPagoController {
  constructor(private readonly metodoPagoService: MetodoPagoService) { }

  @Get()
  async mostrarMetodosDePago(): Promise<ResponseMetodoPagoDto[]> {
    return this.metodoPagoService.mostrarMetodosDePago();
  }

  @Post()
  async create(@Body() datos: CreateMetodoPagoDto): Promise<ResponseMetodoPagoDto> {
    return this.metodoPagoService.create(datos);
  }

  @Get(':metodo_pago_id')
  async findOne(@Param('metodo_pago_id', ParseIntPipe) metodo_pago_id: number): Promise<ResponseMetodoPagoDto> {
    return this.metodoPagoService.findOne(metodo_pago_id);
  }

  @Patch(':metodo_pago_id')
  async update(
    @Param('metodo_pago_id', ParseIntPipe) metodo_pago_id: number,
    @Body() datos: UpdateMetodoPagoDto,
  ): Promise<ResponseMetodoPagoDto> {
    return this.metodoPagoService.update(metodo_pago_id, datos);
  }

  @Delete(':metodo_pago_id')
  async remove(@Param('metodo_pago_id', ParseIntPipe) metodo_pago_id: number): Promise<void> {
    return this.metodoPagoService.remove(metodo_pago_id);
  }
}
