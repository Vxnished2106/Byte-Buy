import type { Categoria } from "./categoria.interface";
import type { Etiqueta } from "./etiqueta.interface";

/** Estado de publicación de un producto. */
export type ProductoEstado = "activo" | "inactivo";

/** Forma que entrega el backend para un producto (sin datos de inventario). */
export interface Producto {
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
}

/** Datos enviados al backend para crear un producto. */
export interface CreateProducto {
  producto_nombre: string;
  producto_descripcion?: string;
  producto_precio: number;
  producto_impuesto?: number;
  producto_descuento?: number;
  producto_estado?: ProductoEstado;
  categoria_ids?: number[];
  etiqueta_ids?: number[];
}

/** Datos editables de un producto (todos los campos de `CreateProducto` son opcionales). */
export type UpdateProducto = Partial<CreateProducto>;

/** Forma que entrega `GET /productos/:id` (detalle público, incluye stock). */
export interface DetalleProducto extends Producto {
  stock_actual: number;
  puedeComprar: boolean;
}

/** Forma que entrega `GET /productos/catalogo` (listado público liviano con disponibilidad). */
export interface ProductoCatalogo {
  producto_id: number;
  producto_nombre: string;
  producto_precio: number;
  producto_imagen: string | null;
  disponible: boolean;
}

/**
 * Fila usada por la tabla del panel de administración (la vista "Productos"
 * es en realidad producto + inventario combinados). El orden de las
 * propiedades debe coincidir con `producto_columns_name` en `admin.tsx`, y
 * `producto_estado` va al final porque `Table.tsx` usa el primer campo
 * boolean del objeto para la columna "Estados".
 */
export interface productoData {
  producto_id: number;
  producto_nombre: string;
  producto_descripcion: string;
  producto_precio: number;
  producto_stock: number;
  producto_stock_minimo: number;
  producto_categoria: string;
  producto_proveedor: string;
  producto_precio_compra: string;
  producto_descuento: number;
  producto_impuesto: number;
  producto_estado: boolean;
}

/** Datos editables desde el formulario de producto (crear/editar). */
export interface ProductoFormValues {
  producto_id: number;
  producto_nombre: string;
  producto_descripcion: string;
  producto_precio: number;
  producto_descuento: number;
  producto_impuesto: number;
  producto_imagen: File | string;
  producto_banner: File | string;
  producto_estado: boolean;
  categoria_ids: number[];
  etiqueta_ids: number[];
  stock_actual: number;
  stock_minimo: number;
  proveedor_id: number;
  precio_compra: number;
}
