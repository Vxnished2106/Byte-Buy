export interface Inventario {
  inventario_id: number;
  producto_id: number;
  inventario_stock_actual: number;
  inventario_stock_minimo: number;
  inventario_fecha_actualizacion: string;
}

export interface CreateInventario {
  producto_id: number;
  inventario_stock_actual: number;
  inventario_stock_minimo: number;
}

export type UpdateInventario = Partial<CreateInventario>;
