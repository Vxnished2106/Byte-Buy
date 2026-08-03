import { Categoria } from '../../categoria/entities/categoria.entity';
import { Etiqueta } from '../../etiqueta/entities/etiqueta.entity';
import { ProductoEstado } from '../entities/producto.entity';

export class ResponseDetalleCompraConVentaDto {
  detalle_compra_id: number;
  detalle_compra_cantidad: number;
  detalle_compra_precio_unitario: number;
  detalle_compra_descuento: number;
  detalle_compra_impuesto: number;
  detalle_compra_subtotal: number;
  detalle_compra_total: number;
  venta_id: number;
  venta_estado: string;
  venta_fecha: Date;
}

export class ResponseProductoMasVendidoDto {
  producto_id: number;
  producto_nombre: string;
  producto_estado: ProductoEstado;
  producto_descripcion: string | null;
  producto_precio: number;
  producto_impuesto: number;
  producto_descuento: number;
  producto_imagen: string | null;
  producto_banner: string | null;
  categorias: Categoria[];
  etiquetas: Etiqueta[];
  total_vendido: number;
  detalles_compra: ResponseDetalleCompraConVentaDto[];
}
