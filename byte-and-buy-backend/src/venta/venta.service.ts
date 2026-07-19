import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Carrito } from '../carrito/entities/carrito.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ResponseVentaDto } from './dto/response-venta.dto';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Carrito)
    private readonly carritoRepository: Repository<Carrito>,
  ) { }

  private toResponseDto(venta: Venta): ResponseVentaDto {
    return {
      venta_id: venta.venta_id,
      usuario_id: venta.usuario_id,
      carrito_id: venta.carrito_id,
      venta_fecha: venta.venta_fecha,
      venta_monto: venta.venta_monto,
      venta_estado: venta.venta_estado,
    };
  }

  async registrarVenta(datos: CreateVentaDto & { usuario_id: number }): Promise<ResponseVentaDto> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_id: datos.usuario_id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const carrito = await this.carritoRepository.findOneBy({ carrito_id: datos.carrito_id });
    if (!carrito) throw new NotFoundException('Carrito no encontrado');

    const venta = this.ventaRepository.create({
      usuario_id: datos.usuario_id,
      carrito_id: datos.carrito_id,
      venta_monto: datos.venta_monto,
      venta_estado: 'aprobado',
    });

    const guardado = await this.ventaRepository.save(venta);
    return this.toResponseDto(guardado);
  }

  async findOne(venta_id: number): Promise<ResponseVentaDto> {
    const venta = await this.ventaRepository.findOneBy({ venta_id });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return this.toResponseDto(venta);
  }

  async findByUsuario(usuario_id: number): Promise<ResponseVentaDto[]> {
    const ventas = await this.ventaRepository.find({ where: { usuario_id } });
    return ventas.map(this.toResponseDto);
  }

  async update(venta_id: number, datos: UpdateVentaDto): Promise<ResponseVentaDto> {
    const venta = await this.ventaRepository.findOneBy({ venta_id });
    if (!venta) throw new NotFoundException('Venta no encontrada');

    Object.assign(venta, datos);
    const guardado = await this.ventaRepository.save(venta);
    return this.toResponseDto(guardado);
  }
}
