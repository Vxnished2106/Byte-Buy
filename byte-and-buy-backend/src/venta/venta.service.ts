import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Carrito } from '../carrito/entities/carrito.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ResponseVentaDto } from './dto/response-venta.dto';

/**
 * Servicio de ventas.
 * Contiene la lógica para el registro y la gestión de ventas.
 */
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

  /**
   * Convierte una entidad Venta a su DTO de respuesta.
   * @param venta Entidad Venta.
   * @returns DTO de respuesta.
   */
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

  /**
   * Registra una nueva venta con estado "aprobado".
   * @param datos Datos de la venta, incluyendo el ID del usuario.
   * @returns Venta registrada.
   * @throws NotFoundException Si el usuario o el carrito no existen.
   */
  async registrarVenta(datos: CreateVentaDto & { usuario_id: number }): Promise<ResponseVentaDto> {
    const usuario = await this.usuarioRepository.findOneBy({ usuario_id: datos.usuario_id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // El carrito es opcional: solo se valida cuando la venta se origina de uno
    // (checkout normal). Al finalizar un pedido en BORRADOR no hay carrito.
    if (datos.carrito_id != null) {
      const carrito = await this.carritoRepository.findOneBy({ carrito_id: datos.carrito_id });
      if (!carrito) throw new NotFoundException('Carrito no encontrado');
    }

    const venta = this.ventaRepository.create({
      usuario_id: datos.usuario_id,
      carrito_id: datos.carrito_id ?? null,
      venta_monto: datos.venta_monto,
      venta_estado: 'aprobado',
    });

    const guardado = await this.ventaRepository.save(venta);
    return this.toResponseDto(guardado);
  }

  /**
   * Obtiene una venta por su ID.
   * @param venta_id ID de la venta.
   * @returns DTO de la venta.
   * @throws NotFoundException Si la venta no existe.
   */
  async findOne(venta_id: number): Promise<ResponseVentaDto> {
    const venta = await this.ventaRepository.findOneBy({ venta_id });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return this.toResponseDto(venta);
  }

  /**
   * Obtiene todas las ventas de un usuario.
   * @param usuario_id ID del usuario.
   * @returns Lista de ventas del usuario.
   */
  async findByUsuario(usuario_id: number): Promise<ResponseVentaDto[]> {
    const ventas = await this.ventaRepository.find({ where: { usuario_id } });
    return ventas.map(this.toResponseDto);
  }

  /**
   * Actualiza una venta existente.
   * @param venta_id ID de la venta.
   * @param datos Nuevos datos de la venta.
   * @returns Venta actualizada.
   * @throws NotFoundException Si la venta no existe.
   */
  async update(venta_id: number, datos: UpdateVentaDto): Promise<ResponseVentaDto> {
    const venta = await this.ventaRepository.findOneBy({ venta_id });
    if (!venta) throw new NotFoundException('Venta no encontrada');

    Object.assign(venta, datos);
    const guardado = await this.ventaRepository.save(venta);
    return this.toResponseDto(guardado);
  }
}
