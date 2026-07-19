import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPago } from './entities/metodo_pago.entity';
import { CreateMetodoPagoDto } from './dto/create-metodo_pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo_pago.dto';
import { ResponseMetodoPagoDto } from './dto/response-metodo_pago.dto';

@Injectable()
export class MetodoPagoService {
  constructor(
    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
  ) { }

  private toResponseDto(metodoPago: MetodoPago): ResponseMetodoPagoDto {
    return {
      metodo_pago_id: metodoPago.metodo_pago_id,
      metodo_pago_nombre: metodoPago.metodo_pago_nombre,
    };
  }

  async mostrarMetodosDePago(): Promise<ResponseMetodoPagoDto[]> {
    const metodos = await this.metodoPagoRepository.find();
    return metodos.map(this.toResponseDto);
  }

  async create(datos: CreateMetodoPagoDto): Promise<ResponseMetodoPagoDto> {
    const metodo = this.metodoPagoRepository.create(datos);
    const guardado = await this.metodoPagoRepository.save(metodo);
    return this.toResponseDto(guardado);
  }

  async findOne(metodo_pago_id: number): Promise<ResponseMetodoPagoDto> {
    const metodo = await this.metodoPagoRepository.findOneBy({ metodo_pago_id });
    if (!metodo) throw new NotFoundException('Método de pago no encontrado');
    return this.toResponseDto(metodo);
  }

  async update(metodo_pago_id: number, datos: UpdateMetodoPagoDto): Promise<ResponseMetodoPagoDto> {
    const metodo = await this.metodoPagoRepository.findOneBy({ metodo_pago_id });
    if (!metodo) throw new NotFoundException('Método de pago no encontrado');

    Object.assign(metodo, datos);
    const guardado = await this.metodoPagoRepository.save(metodo);
    return this.toResponseDto(guardado);
  }

  async remove(metodo_pago_id: number): Promise<void> {
    const metodo = await this.metodoPagoRepository.findOneBy({ metodo_pago_id });
    if (!metodo) throw new NotFoundException('Método de pago no encontrado');
    await this.metodoPagoRepository.remove(metodo);
  }
}
