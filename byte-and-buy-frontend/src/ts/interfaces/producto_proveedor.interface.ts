/** Estado de una asignación producto-proveedor. */
export type ProductoProveedorEstado = "activo" | "inactivo";

/** Forma que entrega el backend para una asignación producto-proveedor. */
export interface ProductoProveedor {
  producto_proveedor_id: number;
  producto_proveedor_codigo: string | null;
  producto_proveedor_precio: number;
  producto_proveedor_estado: ProductoProveedorEstado;
  producto_id: number;
  proveedor_id: number;
  proveedor?: {
    proveedor_id: number;
    proveedor_nombre: string;
    proveedor_direccion: string | null;
    proveedor_telefono: string | null;
  };
}

/** Datos enviados al backend para asignar un proveedor a un producto (con su precio de compra). */
export interface AsignarProveedor {
  producto_id: number;
  proveedor_id: number;
  producto_proveedor_codigo?: string;
  producto_proveedor_precio: number;
}
