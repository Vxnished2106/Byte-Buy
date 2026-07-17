import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Carrito } from './entities/carrito.entity';
import { CarritoItem } from './entities/carrito-item.entity';
import { Producto } from '../producto/entities/producto.entity';
import { InventarioService } from '../inventario/inventario.service';
import { AgregarItemDto } from './dto/agregar-item.dto';
import { ActualizarItemDto } from './dto/actualizar-item.dto';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito)
    private readonly carritoRepository: Repository<Carrito>,

    @InjectRepository(CarritoItem)
    private readonly itemRepository: Repository<CarritoItem>,

    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,

    private readonly inventarioService: InventarioService,
  ) {}

  /**
   * Obtiene el carrito del usuario autenticado; si aún no existe lo crea.
   * Se usa como punto de entrada de todas las operaciones del carrito para
   * garantizar que cada usuario opere siempre sobre su propio carrito.
   */
  async obtenerOCrearCarrito(usuario_id: number): Promise<Carrito> {
    let carrito = await this.carritoRepository.findOne({
      where: { usuario_id },
      relations: ['items', 'items.producto'],
    });

    if (!carrito) {
      carrito = await this.carritoRepository.save(
        this.carritoRepository.create({ usuario_id }),
      );
    }

    return carrito;
  }

  /**
   * Agrega un producto al carrito. Si el producto ya está en el carrito,
   * suma la cantidad. Valida que la cantidad total resultante no supere el
   * stock disponible (consultado al módulo de inventario).
   */
  async agregarItem(
    usuario_id: number,
    dto: AgregarItemDto,
  ): Promise<Carrito> {
    const carrito = await this.obtenerOCrearCarrito(usuario_id);

    const existente = await this.itemRepository.findOne({
      where: { carrito_id: carrito.carrito_id, producto_id: dto.producto_id },
    });

    const cantidadTotal = (existente?.cantidad ?? 0) + dto.cantidad;
    await this.validarStock(dto.producto_id, cantidadTotal);

    if (existente) {
      existente.cantidad = cantidadTotal;
      await this.itemRepository.save(existente);
    } else {
      await this.itemRepository.save(
        this.itemRepository.create({
          carrito_id: carrito.carrito_id,
          producto_id: dto.producto_id,
          cantidad: dto.cantidad,
        }),
      );
    }

    return this.obtenerOCrearCarrito(usuario_id);
  }

  /**
   * Reemplaza la cantidad de un producto ya presente en el carrito, validando
   * el stock disponible para la nueva cantidad.
   */
  async actualizarCantidad(
    usuario_id: number,
    producto_id: number,
    dto: ActualizarItemDto,
  ): Promise<Carrito> {
    const carrito = await this.obtenerOCrearCarrito(usuario_id);

    const item = await this.itemRepository.findOne({
      where: { carrito_id: carrito.carrito_id, producto_id },
    });

    if (!item) {
      throw new NotFoundException('El producto no está en el carrito');
    }

    await this.validarStock(producto_id, dto.cantidad);

    item.cantidad = dto.cantidad;
    await this.itemRepository.save(item);

    return this.obtenerOCrearCarrito(usuario_id);
  }

  /** Elimina un producto del carrito del usuario. */
  async eliminarItem(
    usuario_id: number,
    producto_id: number,
  ): Promise<Carrito> {
    const carrito = await this.obtenerOCrearCarrito(usuario_id);

    const resultado = await this.itemRepository.delete({
      carrito_id: carrito.carrito_id,
      producto_id,
    });

    if (!resultado.affected) {
      throw new NotFoundException('El producto no está en el carrito');
    }

    return this.obtenerOCrearCarrito(usuario_id);
  }

  /**
   * Valida que el producto exista y que tenga stock suficiente para la
   * cantidad indicada, consumiendo la disponibilidad del módulo de inventario.
   */
  private async validarStock(
    producto_id: number,
    cantidad: number,
  ): Promise<void> {
    const producto = await this.productoRepository.findOneBy({ producto_id });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const { disponible, stock_actual } =
      await this.inventarioService.verificarDisponibilidad(
        producto_id,
        cantidad,
      );

    if (!disponible) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${stock_actual}`,
      );
    }
  }
}
