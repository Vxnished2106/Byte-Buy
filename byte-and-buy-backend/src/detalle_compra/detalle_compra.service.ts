import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleCompra } from './entities/detalle_compra.entity';
import { ProductoService } from '../producto/producto.service';
import { CreateDetalleCompraDto } from './dto/create-detalle_compra.dto';
import { ResponseDetalleCompraDto } from './dto/response-detalle_compra.dto';

@Injectable()
export class DetalleCompraService {
  constructor(
    @InjectRepository(DetalleCompra)
    private readonly detalleCompraRepository: Repository<DetalleCompra>,
    private readonly productoService: ProductoService,
  ) {}

  private toResponseDto(detalle: DetalleCompra): ResponseDetalleCompraDto {
    return {
      detalle_compra_id: detalle.detalle_compra_id,
      venta_id: detalle.venta_id,
      producto_id: detalle.producto_id,
      producto: detalle.producto
        ? {
            producto_id: detalle.producto.producto_id,
            producto_nombre: detalle.producto.producto_nombre,
            producto_descripcion: detalle.producto.producto_descripcion,
            producto_imagen: detalle.producto.producto_imagen,
          }
        : undefined,
      detalle_compra_cantidad: detalle.detalle_compra_cantidad,
      detalle_compra_precio_unitario: detalle.detalle_compra_precio_unitario,
      detalle_compra_descuento: detalle.detalle_compra_descuento,
      detalle_compra_impuesto: detalle.detalle_compra_impuesto,
      detalle_compra_subtotal: detalle.detalle_compra_subtotal,
      detalle_compra_total: detalle.detalle_compra_total,
      created_at: detalle.created_at,
      updated_at: detalle.updated_at,
    };
  }

  async registrarDetalleCompra(datos: CreateDetalleCompraDto): Promise<ResponseDetalleCompraDto> {
    const producto = await this.productoService.findEntity(datos.producto_id);

    const precioUnitario = Number(producto.producto_precio);
    const descuento = Number(producto.producto_descuento);
    const impuesto = Number(producto.producto_impuesto);

    const subtotal = precioUnitario * datos.cantidad;

    const descuentoAplicado = subtotal * (descuento / 100);
    const montoBase = subtotal - descuentoAplicado;

    const impuestoAplicado = montoBase * (impuesto / 100);

    const total = montoBase + impuestoAplicado;

    const detalle = this.detalleCompraRepository.create({
      venta_id: datos.venta_id,
      producto_id: datos.producto_id,
      detalle_compra_cantidad: datos.cantidad,
      detalle_compra_precio_unitario: precioUnitario,
      detalle_compra_descuento: descuento,
      detalle_compra_impuesto: impuesto,
      detalle_compra_subtotal: Number(subtotal.toFixed(2)),
      detalle_compra_total: Number(total.toFixed(2)),
    });

    const guardado = await this.detalleCompraRepository.save(detalle);

    return this.mostrarDetalle(guardado.detalle_compra_id);
  }

  async mostrarDetalle(detalleCompraId: number): Promise<ResponseDetalleCompraDto> {
    const detalle = await this.detalleCompraRepository.findOne({
      where: { detalle_compra_id: detalleCompraId },
      relations: ['producto'],
    });

    if (!detalle) {
      throw new NotFoundException('Detalle de compra no encontrado');
    }

    return this.toResponseDto(detalle);
  }

  async findByVenta(venta_id: number): Promise<ResponseDetalleCompraDto[]> {
    const detalles = await this.detalleCompraRepository.find({
      where: { venta_id },
      relations: ['producto'],
    });

    return detalles.map((detalle) => this.toResponseDto(detalle));
  }
}