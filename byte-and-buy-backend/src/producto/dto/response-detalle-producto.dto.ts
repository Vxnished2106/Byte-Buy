/**
 * DTO de respuesta para el detalle de un producto
 */
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Etiqueta } from '../../etiqueta/entities/etiqueta.entity';
import { ProductoEstado } from '../entities/producto.entity';

/**
 * DTO que contiene los datos detallados de un producto
 */
export class ResponseDetalleProductoDto {
  /** Identificador único del producto */
  producto_id: number;

  /** Nombre del producto */
  producto_nombre: string;

  /** Estado del producto */
  producto_estado: ProductoEstado;

  /** Descripción detallada del producto */
  producto_descripcion: string | null;

  /** Precio base del producto */
  producto_precio: number;

  /** Porcentaje de impuesto aplicado al producto */
  producto_impuesto: number;

  /** Porcentaje de descuento aplicado al producto */
  producto_descuento: number;

  /** URL de la imagen principal del producto */
  producto_imagen: string | null;

  /** URL del banner del producto */
  producto_banner: string | null;

  /** Categorías asociadas al producto */
  categorias: Categoria[];

  /** Etiquetas asociadas al producto */
  etiquetas: Etiqueta[];

  /** Stock actual del producto */
  stock_actual: number;

  /** Indica si el producto tiene stock suficiente para comprar */
  puedeComprar: boolean;
}