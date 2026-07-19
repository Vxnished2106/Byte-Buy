import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { Venta } from '../venta/entities/venta.entity';
import { MetodoPago } from '../metodo_pago/entities/metodo_pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { ResponsePagoDto } from './dto/response-pago.dto';

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

  async findOne(pago_id: number): Promise<ResponsePagoDto> {
    const pago = await this.pagoRepository.findOneBy({ pago_id });
    if (!pago) throw new NotFoundException('Pago no encontrado');
    return this.toResponseDto(pago);
  }

  async findByVenta(venta_id: number): Promise<ResponsePagoDto[]> {
    const pagos = await this.pagoRepository.find({ where: { venta_id } });
    return pagos.map(this.toResponseDto);
  }

  async update(pago_id: number, datos: UpdatePagoDto): Promise<ResponsePagoDto> {
    const pago = await this.pagoRepository.findOneBy({ pago_id });
    if (!pago) throw new NotFoundException('Pago no encontrado');

    Object.assign(pago, datos);
    const guardado = await this.pagoRepository.save(pago);
    return this.toResponseDto(guardado);
  }
}
