import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inventario } from './entities/inventario.entity';
import { Producto } from '../producto/entities/producto.entity';

import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { ResponseInventarioDto } from './dto/response-inventario.dto';

@Injectable()
export class InventarioService {

  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,

    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  private toResponseDto(inventario: Inventario): ResponseInventarioDto {
    return {
      inventario_id: inventario.inventario_id,
      producto_id: inventario.producto_id,
      inventario_stock_actual: inventario.inventario_stock_actual,
      inventario_stock_minimo: inventario.inventario_stock_minimo,
      inventario_fecha_actualizacion: inventario.inventario_fecha_actualizacion,
    };
  }

  async registrarInventario(
    datos: CreateInventarioDto,
  ): Promise<ResponseInventarioDto> {

    if (datos.inventario_stock_actual < 0) {
      throw new BadRequestException(
        'El stock inicial no puede ser negativo',
      );
    }

    const producto = await this.productoRepository.findOneBy({
      producto_id: datos.producto_id,
    });

    if (!producto) {
      throw new NotFoundException(
        'Producto no encontrado',
      );
    }

    const existe = await this.inventarioRepository.findOneBy({
      producto_id: datos.producto_id,
    });

    if (existe) {
      throw new BadRequestException(
        'El producto ya tiene inventario registrado',
      );
    }

    const inventario = this.inventarioRepository.create({
      producto_id: datos.producto_id,
      inventario_stock_actual: datos.inventario_stock_actual ?? 0,
      inventario_stock_minimo: datos.inventario_stock_minimo ?? 0,
    });

    return this.toResponseDto(
      await this.inventarioRepository.save(inventario),
    );
  }


  async mostrarInventario(): Promise<ResponseInventarioDto[]> {

    const inventarios = await this.inventarioRepository.find({
      relations: ['producto'],
      order: {
        inventario_stock_actual: 'ASC',
      },
    });

    return inventarios.map(i =>
      this.toResponseDto(i),
    );
  }


  async obtenerInventario(
    inventario_id: number,
  ): Promise<ResponseInventarioDto> {

    return this.toResponseDto(
      await this.findEntity(inventario_id),
    );
  }


  async findByProducto(
    producto_id: number,
  ): Promise<ResponseInventarioDto> {

    const inventario =
      await this.inventarioRepository.findOne({
        where: {
          producto_id,
        },
        relations: ['producto'],
      });

    if (!inventario) {
      throw new NotFoundException(
        'Inventario no encontrado',
      );
    }

    return this.toResponseDto(inventario);
  }


  /**
   * Verifica si un producto tiene stock suficiente para la cantidad pedida.
   * Lo consume el módulo de carrito para validar la disponibilidad antes de
   * agregar o actualizar ítems. Si el producto no tiene inventario registrado
   * se considera no disponible (stock 0).
   */
  async verificarDisponibilidad(
    producto_id: number,
    cantidad: number,
  ): Promise<{ disponible: boolean; stock_actual: number }> {

    const inventario =
      await this.inventarioRepository.findOne({
        where: {
          producto_id,
        },
      });

    const stock_actual =
      inventario?.inventario_stock_actual ?? 0;

    return {
      disponible: stock_actual >= cantidad,
      stock_actual,
    };
  }


  async editarInventario(
    inventario_id: number,
    datos: UpdateInventarioDto,
  ): Promise<ResponseInventarioDto> {

    const inventario =
      await this.findEntity(inventario_id);


    if (
      datos.inventario_stock_actual !== undefined &&
      datos.inventario_stock_actual < 0
    ) {
      throw new BadRequestException(
        'El stock no puede ser negativo',
      );
    }


    Object.assign(
      inventario,
      datos,
    );

    inventario.inventario_fecha_actualizacion =
      new Date();


    return this.toResponseDto(
      await this.inventarioRepository.save(inventario),
    );
  }


  async aumentarStock(
    producto_id: number,
    cantidad: number,
  ): Promise<ResponseInventarioDto> {

    if (cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad debe ser mayor que cero',
      );
    }

    const inventario =
      await this.obtenerEntidadPorProducto(producto_id);


    inventario.inventario_stock_actual += cantidad;

    inventario.inventario_fecha_actualizacion =
      new Date();


    return this.toResponseDto(
      await this.inventarioRepository.save(inventario),
    );
  }


  async descontarStock(
    producto_id: number,
    cantidad: number,
  ): Promise<ResponseInventarioDto> {

    if (cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad debe ser mayor que cero',
      );
    }


    const inventario =
      await this.obtenerEntidadPorProducto(producto_id);


    if (
      inventario.inventario_stock_actual < cantidad
    ) {
      throw new BadRequestException(
        'Stock insuficiente',
      );
    }


    inventario.inventario_stock_actual -= cantidad;

    inventario.inventario_fecha_actualizacion =
      new Date();


    return this.toResponseDto(
      await this.inventarioRepository.save(inventario),
    );
  }


  async verificarStockMinimo(
    producto_id: number,
  ): Promise<{ alerta: boolean }> {

    const inventario =
      await this.obtenerEntidadPorProducto(producto_id);


    return {
      alerta:
        inventario.inventario_stock_actual <=
        inventario.inventario_stock_minimo,
    };
  }


  async obtenerProductosStockMinimo(): Promise<ResponseInventarioDto[]> {

    const inventarios =
      await this.inventarioRepository
        .createQueryBuilder('inventario')
        .where(
          'inventario.inventario_stock_actual <= inventario.inventario_stock_minimo',
        )
        .orderBy(
          'inventario.inventario_stock_actual',
          'ASC',
        )
        .getMany();


    return inventarios.map(i =>
      this.toResponseDto(i),
    );
  }


  async listarInventarioPorStock(): Promise<ResponseInventarioDto[]> {

    const inventarios =
      await this.inventarioRepository.find({
        relations: ['producto'],
        order: {
          inventario_stock_actual: 'ASC',
        },
      });


    return inventarios.map(i =>
      this.toResponseDto(i),
    );
  }


  private async obtenerEntidadPorProducto(
    producto_id: number,
  ): Promise<Inventario> {

    const inventario =
      await this.inventarioRepository.findOne({
        where: {
          producto_id,
        },
      });


    if (!inventario) {
      throw new NotFoundException(
        'Inventario no encontrado',
      );
    }


    return inventario;
  }


  async findEntity(
    inventario_id: number,
  ): Promise<Inventario> {

    const inventario =
      await this.inventarioRepository.findOne({
        where: {
          inventario_id,
        },
      });


    if (!inventario) {
      throw new NotFoundException(
        'Inventario no encontrado',
      );
    }


    return inventario;
  }
}