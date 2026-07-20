/**
 * Servicio para la gestión de métodos de pago
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPago } from './entities/metodo_pago.entity';
import { CreateMetodoPagoDto } from './dto/create-metodo_pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo_pago.dto';
import { ResponseMetodoPagoDto } from './dto/response-metodo_pago.dto';

/**
 * Servicio que maneja la lógica de negocio para los métodos de pago
 */
@Injectable()
export class MetodoPagoService {
  constructor(
    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
  ) { }

  /**
   * Convierte una entidad MetodoPago a un DTO de respuesta
   * @param metodoPago - Entidad MetodoPago a convertir
   * @returns DTO de respuesta con los datos del método de pago
   */
  private toResponseDto(metodoPago: MetodoPago): ResponseMetodoPagoDto {
    return {
      metodo_pago_id: metodoPago.metodo_pago_id,
      metodo_pago_nombre: metodoPago.metodo_pago_nombre,
    };
  }

  /**
   * Obtiene la lista de todos los métodos de pago
   * @returns Lista de DTOs de métodos de pago
   */
  async mostrarMetodosDePago(): Promise<ResponseMetodoPagoDto[]> {
    const metodos = await this.metodoPagoRepository.find();
    return metodos.map(this.toResponseDto);
  }

  /**
   * Crea un nuevo método de pago
   * @param datos - Datos del método de pago a crear
   * @returns DTO de respuesta con el método de pago creado
   */
  async create(datos: CreateMetodoPagoDto): Promise<ResponseMetodoPagoDto> {
    const metodo = this.metodoPagoRepository.create(datos);
    const guardado = await this.metodoPagoRepository.save(metodo);
    return this.toResponseDto(guardado);
  }

  /**
   * Obtiene un método de pago por su identificador
   * @param metodo_pago_id - Identificador del método de pago
   * @returns DTO de respuesta con el método de pago
   * @throws NotFoundException si el método de pago no existe
   */
  async findOne(metodo_pago_id: number): Promise<ResponseMetodoPagoDto> {
    const metodo = await this.metodoPagoRepository.findOneBy({ metodo_pago_id });
    if (!metodo) throw new NotFoundException('Método de pago no encontrado');
    return this.toResponseDto(metodo);
  }

  /**
   * Actualiza un método de pago
   * @param metodo_pago_id - Identificador del método de pago
   * @param datos - Datos del método de pago a actualizar
   * @returns DTO de respuesta con el método de pago actualizado
   * @throws NotFoundException si el método de pago no existe
   */
  async update(metodo_pago_id: number, datos: UpdateMetodoPagoDto): Promise<ResponseMetodoPagoDto> {
    const metodo = await this.metodoPagoRepository.findOneBy({ metodo_pago_id });
    if (!metodo) throw new NotFoundException('Método de pago no encontrado');

    Object.assign(metodo, datos);
    const guardado = await this.metodoPagoRepository.save(metodo);
    return this.toResponseDto(guardado);
  }

  /**
   * Elimina un método de pago
   * @param metodo_pago_id - Identificador del método de pago
   * @throws NotFoundException si el método de pago no existe
   */
  async remove(metodo_pago_id: number): Promise<void> {
    const metodo = await this.metodoPagoRepository.findOneBy({ metodo_pago_id });
    if (!metodo) throw new NotFoundException('Método de pago no encontrado');
    await this.metodoPagoRepository.remove(metodo);
  }
}
