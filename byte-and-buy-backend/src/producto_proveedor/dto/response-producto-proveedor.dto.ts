/**
 * DTO de respuesta para una relación producto-proveedor
 */
import { ProductoProveedorEstado } from "../entities/producto_proveedor.entity";

/**
 * DTO que contiene los datos de respuesta de una relación producto-proveedor
 */
export class ResponseProductoProveedorDto {
  /** Identificador único de la relación producto-proveedor */
  producto_proveedor_id: number;

  /** Código de referencia del producto en el proveedor */
  producto_proveedor_codigo: string | null;

  /** Precio de compra del producto en este proveedor */
  producto_proveedor_precio: number;

  /** Estado de la relación producto-proveedor */
  producto_proveedor_estado: ProductoProveedorEstado;

  /** Identificador del producto */
  producto_id: number;

  /** Identificador del proveedor */
  proveedor_id: number;

  /** Datos del proveedor (opcional) */
  proveedor?: {
    proveedor_id: number;
    proveedor_nombre: string;
    proveedor_direccion: string | null;
    proveedor_telefono: string | null;
  };
}