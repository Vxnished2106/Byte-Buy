/** Estados de un pedido (deben coincidir con el enum `PedidoEstado` del backend). */
export type PedidoEstado =
  | "BORRADOR"
  | "CONFIRMADO"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";

/** Línea de un pedido (`ResponseDetallePedidoDto` del backend). */
export interface DetallePedido {
  detalle_pedido_id: number;
  producto_id: number;
  /** Nombre del producto (lo incluye el backend para mostrar sin otra consulta). */
  producto_nombre?: string;
  detalle_pedido_cantidad: number;
  detalle_pedido_precio_unitario: number;
  detalle_pedido_descuento_pct: number;
  detalle_pedido_impuesto_pct: number;
  detalle_pedido_subtotal: number;
  detalle_pedido_descuento_monto: number;
  detalle_pedido_impuesto_monto: number;
  detalle_pedido_total: number;
}

/** Registro del historial de estado (`ResponseHistorialEstadoDto`). */
export interface HistorialEstado {
  historial_id: number;
  estado_anterior: PedidoEstado | null;
  estado_nuevo: PedidoEstado;
  usuario_id: number | null;
  historial_nota: string | null;
  /** Llega como string ISO (JSON no tiene tipo `Date`). */
  created_at: string;
}

/** Pedido completo (`ResponsePedidoDto`). */
export interface Pedido {
  pedido_id: number;
  pedido_numero: string;
  cliente_id: number;
  direccion_envio_id: number | null;
  pedido_fecha: string;
  pedido_notas: string | null;
  pedido_estado: PedidoEstado;
  pedido_subtotal: number;
  pedido_descuento_total: number;
  pedido_impuesto_total: number;
  pedido_total: number;
  /** Versión para control de concurrencia optimista. */
  pedido_version: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  detalles: DetallePedido[];
  /** Presente en la vista de detalle. */
  historial?: HistorialEstado[];
}

/** Envelope paginado del listado (`ResponsePedidoPaginadoDto`). */
export interface PedidoPaginado {
  data: Pedido[];
  total: number;
  page: number;
  limit: number;
  total_paginas: number;
}

/**
 * Línea enviada al crear/editar un pedido: solo producto y cantidad. El precio,
 * el descuento y el impuesto son datos del catálogo y los fija el servidor; el
 * cliente no puede enviarlos.
 */
export interface PedidoItem {
  producto_id: number;
  cantidad: number;
}

/** Cuerpo de `POST /pedidos`. */
export interface CreatePedido {
  cliente_id: number;
  pedido_fecha?: string;
  pedido_notas?: string;
  direccion_envio_id?: number;
  items: PedidoItem[];
}

/** Cuerpo de `PUT /pedidos/:id` (incluye la versión para concurrencia optimista). */
export interface UpdatePedido {
  pedido_version: number;
  pedido_fecha?: string;
  pedido_notas?: string;
  direccion_envio_id?: number;
  items: PedidoItem[];
}

/** Cuerpo de `PATCH /pedidos/:id/estado`. */
export interface CambiarEstadoPedido {
  nuevo_estado: PedidoEstado;
  pedido_version: number;
  nota?: string;
  /**
   * Confirma sin volver a descontar stock (lo usa el checkout: el pago ya lo
   * descontó al registrar el detalle de compra). Solo aplica al confirmar.
   */
  omitir_stock?: boolean;
}

/** Parámetros de consulta del listado `GET /pedidos`. */
export interface ListarPedidosParams {
  estado?: PedidoEstado;
  cliente_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  buscar?: string;
  orden_por?: "pedido_fecha" | "pedido_total" | "pedido_numero" | "created_at";
  orden_dir?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}
