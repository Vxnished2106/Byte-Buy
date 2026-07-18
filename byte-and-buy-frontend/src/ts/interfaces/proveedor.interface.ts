/** Estado de un proveedor. */
export type ProveedorEstado = "activo" | "inactivo";

/** Forma que entrega/recibe el backend para un proveedor. */
export interface Proveedor {
  proveedor_id: number;
  proveedor_nombre: string;
  proveedor_correo: string | null;
  proveedor_telefono: string | null;
  proveedor_direccion: string | null;
  proveedor_estado: ProveedorEstado;
  cantidad_productos?: number;
}

/** Datos enviados al backend para crear un proveedor. */
export interface CreateProveedor {
  proveedor_nombre: string;
  proveedor_correo?: string;
  proveedor_telefono?: string;
  proveedor_direccion?: string;
}

/** Datos editables de un proveedor (todos los campos de `CreateProveedor` son opcionales). */
export type UpdateProveedor = Partial<CreateProveedor>;

/**
 * Fila usada por la tabla del panel de administración: mismos datos que
 * `Proveedor` pero con `proveedor_estado` como boolean, porque `Table.tsx`
 * detecta la columna "Estados" buscando el primer campo boolean del objeto.
 */
export interface proveedorData {
  proveedor_id: number;
  proveedor_nombre: string;
  proveedor_correo: string;
  proveedor_telefono: string;
  proveedor_direccion: string;
  proveedor_estado: boolean;
}
