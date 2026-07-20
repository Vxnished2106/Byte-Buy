/**
 * Controlador para la gestión de métodos de pago
 */
import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MetodoPagoService } from './metodo_pago.service';
import { CreateMetodoPagoDto } from './dto/create-metodo_pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo_pago.dto';
import { ResponseMetodoPagoDto } from './dto/response-metodo_pago.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

/**
 * Controlador que maneja las peticiones HTTP para los métodos de pago
 */
@Controller('metodos-pago')
@UseGuards(SupabaseAuthGuard)
export class MetodoPagoController {
  constructor(private readonly metodoPagoService: MetodoPagoService) { }

  /**
   * Obtiene la lista de todos los métodos de pago
   * @returns Lista de DTOs de métodos de pago
   */
  @Get()
  async mostrarMetodosDePago(): Promise<ResponseMetodoPagoDto[]> {
    return this.metodoPagoService.mostrarMetodosDePago();
  }

  /**
   * Crea un nuevo método de pago
   * @param datos - Datos del método de pago a crear
   * @returns DTO de respuesta con el método de pago creado
   */
  @Post()
  async create(@Body() datos: CreateMetodoPagoDto): Promise<ResponseMetodoPagoDto> {
    return this.metodoPagoService.create(datos);
  }

  /**
   * Obtiene un método de pago por su identificador
   * @param metodo_pago_id - Identificador del método de pago
   * @returns DTO de respuesta con el método de pago
   */
  @Get(':metodo_pago_id')
  async findOne(@Param('metodo_pago_id', ParseIntPipe) metodo_pago_id: number): Promise<ResponseMetodoPagoDto> {
    return this.metodoPagoService.findOne(metodo_pago_id);
  }

  /**
   * Actualiza un método de pago
   * @param metodo_pago_id - Identificador del método de pago
   * @param datos - Datos del método de pago a actualizar
   * @returns DTO de respuesta con el método de pago actualizado
   */
  @Patch(':metodo_pago_id')
  async update(
    @Param('metodo_pago_id', ParseIntPipe) metodo_pago_id: number,
    @Body() datos: UpdateMetodoPagoDto,
  ): Promise<ResponseMetodoPagoDto> {
    return this.metodoPagoService.update(metodo_pago_id, datos);
  }

  /**
   * Elimina un método de pago
   * @param metodo_pago_id - Identificador del método de pago
   */
  @Delete(':metodo_pago_id')
  async remove(@Param('metodo_pago_id', ParseIntPipe) metodo_pago_id: number): Promise<void> {
    return this.metodoPagoService.remove(metodo_pago_id);
  }
}
