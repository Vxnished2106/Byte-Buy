/**
 * Servicio para la gestión del carrito de compras
 */
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
import {
  ResponseCarritoDto,
  ResponseCarritoItemDto,
} from './dto/response-carrito.dto';

/**
 * Servicio que maneja la lógica de negocio para el carrito de compras
 */
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
   * @param usuario_id - Identificador del usuario
   * @returns Carrito del usuario
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
   * @param usuario_id - Identificador del usuario
   * @param dto - Datos del producto a agregar
   * @returns Carrito actualizado
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
   * @param usuario_id - Identificador del usuario
   * @param producto_id - Identificador del producto
   * @param dto - Datos con la nueva cantidad
   * @returns Carrito actualizado
   * @throws NotFoundException si el producto no está en el carrito
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

  /**
   * Elimina un producto del carrito del usuario.
   * @param usuario_id - Identificador del usuario
   * @param producto_id - Identificador del producto
   * @returns Carrito actualizado
   * @throws NotFoundException si el producto no está en el carrito
   */
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
   * Devuelve el carrito del usuario con el cálculo de subtotales por ítem y
   * el total. El descuento y el impuesto del producto se aplican como
   * porcentaje sobre el precio unitario.
   * @param usuario_id - Identificador del usuario
   * @returns Carrito con subtotales y total
   */
  async obtenerCarritoConSubtotales(
    usuario_id: number,
  ): Promise<ResponseCarritoDto> {
    const carrito = await this.obtenerOCrearCarrito(usuario_id);

    const items: ResponseCarritoItemDto[] = (carrito.items ?? []).map(
      (item) => {
        // Los decimales de TypeORM llegan como string; se normalizan a number.
        const precio_unitario = Number(item.producto.producto_precio);
        const descuento = Number(item.producto.producto_descuento);
        const impuesto = Number(item.producto.producto_impuesto);

        const precio_final_unitario =
          precio_unitario * (1 - descuento / 100) * (1 + impuesto / 100);
        const subtotal = precio_final_unitario * item.cantidad;

        return {
          producto_id: item.producto_id,
          producto_nombre: item.producto.producto_nombre,
          precio_unitario: this.redondear(precio_unitario),
          descuento,
          impuesto,
          precio_final_unitario: this.redondear(precio_final_unitario),
          cantidad: item.cantidad,
          subtotal: this.redondear(subtotal),
        };
      },
    );

    const total = this.redondear(
      items.reduce((suma, item) => suma + item.subtotal, 0),
    );

    return {
      carrito_id: carrito.carrito_id,
      items,
      total,
    };
  }

  /**
   * Redondea a 2 decimales para montos monetarios.
   * @param valor - Valor a redondear
   * @returns Valor redondeado a 2 decimales
   */
  private redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  /**
   * Valida que el producto exista y que tenga stock suficiente para la
   * cantidad indicada, consumiendo la disponibilidad del módulo de inventario.
   * @param producto_id - Identificador del producto
   * @param cantidad - Cantidad a validar
   * @throws NotFoundException si el producto no existe
   * @throws BadRequestException si el stock es insuficiente
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
