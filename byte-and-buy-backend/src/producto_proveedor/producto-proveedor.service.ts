/**
 * Servicio para la gestión de relaciones producto-proveedor
 */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductoProveedor, ProductoProveedorEstado } from './entities/producto_proveedor.entity';
import { AsignarProveedorDto } from './dto/asignar-proveedor.dto';
import { ResponseProductoProveedorDto } from './dto/response-producto-proveedor.dto';

/**
 * Servicio que maneja la lógica de negocio para las relaciones entre productos y proveedores
 */
@Injectable()
export class ProductoProveedorService {

  constructor(
    @InjectRepository(ProductoProveedor)
    private readonly productoProveedorRepository: Repository<ProductoProveedor>,
  ) { }

  /**
   * Convierte una entidad ProductoProveedor a un DTO de respuesta
   * @param pp - Entidad ProductoProveedor a convertir
   * @returns DTO de respuesta con los datos de la relación producto-proveedor
   */
  private toResponseDto(pp: ProductoProveedor): ResponseProductoProveedorDto {
    return {
      producto_proveedor_id: pp.producto_proveedor_id,
      producto_proveedor_codigo: pp.producto_proveedor_codigo,
      producto_proveedor_precio: pp.producto_proveedor_precio,
      producto_proveedor_estado: pp.producto_proveedor_estado,
      producto_id: pp.producto_id,
      proveedor_id: pp.proveedor_id,
    };
  }

  /**
   * Asigna un proveedor a un producto
   * @param datos - Datos de la relación producto-proveedor a crear
   * @returns DTO de respuesta con la relación creada
   * @throws BadRequestException si la relación ya existe
   */
  async asignarProveedor(
    datos: AsignarProveedorDto,
  ): Promise<ResponseProductoProveedorDto> {

    const existe =
      await this.productoProveedorRepository.findOne({
        where: {
          producto_id: datos.producto_id,
          proveedor_id: datos.proveedor_id,
        },
      });

    if (existe) {
      throw new BadRequestException(
        'El producto ya está asignado a este proveedor',
      );
    }

    const pp =
      this.productoProveedorRepository.create({
        ...datos,
        producto_proveedor_estado:
          ProductoProveedorEstado.ACTIVO,
      });

    const guardado =
      await this.productoProveedorRepository.save(pp);

    return this.toResponseDto(guardado);
  }

  /**
   * Actualiza el precio de compra de un producto en un proveedor
   * @param producto_proveedor_id - Identificador de la relación producto-proveedor
   * @param nuevoPrecio - Nuevo precio de compra
   * @returns DTO de respuesta con la relación actualizada
   * @throws NotFoundException si la relación no existe
   * @throws BadRequestException si el nuevo precio es menor o igual a cero
   */
  async actualizarPrecioCompra(
    producto_proveedor_id: number,
    nuevoPrecio: number,
  ): Promise<ResponseProductoProveedorDto> {

    const pp =
      await this.findEntity(producto_proveedor_id);

    if (nuevoPrecio <= 0) {
      throw new BadRequestException(
        'El precio debe ser mayor que cero',
      );
    }

    pp.producto_proveedor_precio =
      nuevoPrecio;

    return this.toResponseDto(
      await this.productoProveedorRepository.save(pp),
    );
  }

  /**
   * Lista los proveedores asociados a un producto
   * @param producto_id - Identificador del producto
   * @returns Lista de DTOs de respuesta con los proveedores del producto
   */
  async listarProveedoresPorProducto(
    producto_id: number,
  ): Promise<ResponseProductoProveedorDto[]> {

    const lista =
      await this.productoProveedorRepository.find({
        where: {
          producto_id,
        },
        relations: [
          'proveedor',
        ],
      });

    return lista.map(pp => ({
      ...this.toResponseDto(pp),

      proveedor: {
        proveedor_id:
          pp.proveedor.proveedor_id,

        proveedor_nombre:
          pp.proveedor.proveedor_nombre,

        proveedor_direccion:
          pp.proveedor.proveedor_direccion,

        proveedor_telefono:
          pp.proveedor.proveedor_telefono,

      },
    }));
  }

  /**
   * Cambia el estado de una relación producto-proveedor
   * @param producto_proveedor_id - Identificador de la relación producto-proveedor
   * @param estado - Nuevo estado de la relación
   * @returns DTO de respuesta con la relación actualizada
   * @throws NotFoundException si la relación no existe
   */
  async cambiarEstado(
    producto_proveedor_id: number,
    estado: ProductoProveedorEstado,
  ): Promise<ResponseProductoProveedorDto> {

    const pp =
      await this.findEntity(producto_proveedor_id);

    pp.producto_proveedor_estado =
      estado;

    return this.toResponseDto(
      await this.productoProveedorRepository.save(pp),
    );
  }

  /**
   * Elimina una relación producto-proveedor
   * @param producto_proveedor_id - Identificador de la relación producto-proveedor
   * @throws NotFoundException si la relación no existe
   */
  async eliminarAsignacion(
    producto_proveedor_id: number,
  ): Promise<void> {

    const pp =
      await this.findEntity(producto_proveedor_id);

    await this.productoProveedorRepository.remove(pp);
  }

  /**
   * Obtiene la entidad de relación producto-proveedor por su identificador
   * @param producto_proveedor_id - Identificador de la relación producto-proveedor
   * @returns Entidad de relación producto-proveedor
   * @throws NotFoundException si la relación no existe
   */
  async findEntity(
    producto_proveedor_id: number,
  ): Promise<ProductoProveedor> {

    const pp =
      await this.productoProveedorRepository.findOne({
        where: {
          producto_proveedor_id,
        },
      });

    if (!pp) {
      throw new NotFoundException(
        'Producto-Proveedor no encontrado',
      );
    }

    return pp;
  }
}