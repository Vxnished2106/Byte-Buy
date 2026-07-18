/** Forma que entrega el backend para el inventario de un producto. */
export interface Inventario {
  inventario_id: number;
  producto_id: number;
  inventario_stock_actual: number;
  inventario_stock_minimo: number;
  inventario_fecha_actualizacion: string;
}

/** Datos enviados al backend para crear el registro de inventario de un producto. */
export interface CreateInventario {
  producto_id: number;
  inventario_stock_actual: number;
  inventario_stock_minimo: number;
}

/** Datos editables del inventario (todos los campos de `CreateInventario` son opcionales). */
export type UpdateInventario = Partial<CreateInventario>;
