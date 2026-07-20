import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { Venta } from '../venta/entities/venta.entity';
import { MetodoPago } from '../metodo_pago/entities/metodo_pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { ResponsePagoDto } from './dto/response-pago.dto';

/**
 * Servicio de pagos.
 * Contiene la lógica para el registro y la gestión de pagos de una venta.
 */
@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
  ) { }

  /**
   * Convierte una entidad Pago a su DTO de respuesta.
   * @param pago Entidad Pago.
   * @returns DTO de respuesta.
   */
  private toResponseDto(pago: Pago): ResponsePagoDto {
    return {
      pago_id: pago.pago_id,
      venta_id: pago.venta_id,
      metodo_pago_id: pago.metodo_pago_id,
      pago_monto: pago.pago_monto,
      pago_fecha: pago.pago_fecha,
      pago_estado: pago.pago_estado,
      pago_detalle: pago.pago_detalle,
    };
  }

  /**
   * Registra un nuevo pago para una venta con estado "aprobado".
   * @param datos Datos del pago.
   * @returns Pago registrado.
   * @throws NotFoundException Si la venta o el método de pago no existen.
   */
  async registrarPago(datos: CreatePagoDto): Promise<ResponsePagoDto> {
    const venta = await this.ventaRepository.findOneBy({ venta_id: datos.venta_id });
    if (!venta) throw new NotFoundException('Venta no encontrada');

    const metodoPago = await this.metodoPagoRepository.findOneBy({ metodo_pago_id: datos.metodo_pago_id });
    if (!metodoPago) throw new NotFoundException('Método de pago no encontrado');

    const pago = this.pagoRepository.create({
      ...datos,
      pago_estado: 'aprobado',
    });

    const guardado = await this.pagoRepository.save(pago);
    return this.toResponseDto(guardado);
  }

  /**
   * Obtiene un pago por su ID.
   * @param pago_id ID del pago.
   * @returns DTO del pago.
   * @throws NotFoundException Si el pago no existe.
   */
  async findOne(pago_id: number): Promise<ResponsePagoDto> {
    const pago = await this.pagoRepository.findOneBy({ pago_id });
    if (!pago) throw new NotFoundException('Pago no encontrado');
    return this.toResponseDto(pago);
  }

  /**
   * Obtiene todos los pagos asociados a una venta.
   * @param venta_id ID de la venta.
   * @returns Lista de pagos de la venta.
   */
  async findByVenta(venta_id: number): Promise<ResponsePagoDto[]> {
    const pagos = await this.pagoRepository.find({ where: { venta_id } });
    return pagos.map(this.toResponseDto);
  }

  /**
   * Actualiza un pago existente.
   * @param pago_id ID del pago.
   * @param datos Nuevos datos del pago.
   * @returns Pago actualizado.
   * @throws NotFoundException Si el pago no existe.
   */
  async update(pago_id: number, datos: UpdatePagoDto): Promise<ResponsePagoDto> {
    const pago = await this.pagoRepository.findOneBy({ pago_id });
    if (!pago) throw new NotFoundException('Pago no encontrado');

    Object.assign(pago, datos);
    const guardado = await this.pagoRepository.save(pago);
    return this.toResponseDto(guardado);
  }
}
