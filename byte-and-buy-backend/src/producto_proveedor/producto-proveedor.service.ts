import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductoProveedor, ProductoProveedorEstado } from './entities/producto_proveedor.entity';
import { AsignarProveedorDto } from './dto/asignar-proveedor.dto';
import { ResponseProductoProveedorDto } from './dto/response-producto-proveedor.dto';

@Injectable()
export class ProductoProveedorService {

  constructor(
    @InjectRepository(ProductoProveedor)
    private readonly productoProveedorRepository: Repository<ProductoProveedor>,
  ) { }


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



  async eliminarAsignacion(
    producto_proveedor_id: number,
  ): Promise<void> {


    const pp =
      await this.findEntity(producto_proveedor_id);


    await this.productoProveedorRepository.remove(pp);
  }



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