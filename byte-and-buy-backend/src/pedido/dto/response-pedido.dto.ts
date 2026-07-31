import { PedidoEstado } from '../entities/pedido.entity';

/**
 * DTO de respuesta para una línea de pedido.
 */
export class ResponseDetallePedidoDto {
  /** ID único del detalle de pedido. */
  detalle_pedido_id: number;

  /** ID del producto pedido. */
  producto_id: number;

  /** Nombre del producto (para mostrar sin otra consulta). */
  producto_nombre?: string;

  /** Cantidad pedida. */
  detalle_pedido_cantidad: number;

  /** Precio unitario aplicado. */
  detalle_pedido_precio_unitario: number;

  /** Porcentaje de descuento de la línea. */
  detalle_pedido_descuento_pct: number;

  /** Porcentaje de impuesto de la línea. */
  detalle_pedido_impuesto_pct: number;

  /** Subtotal de la línea (precio × cantidad). */
  detalle_pedido_subtotal: number;

  /** Monto de descuento de la línea. */
  detalle_pedido_descuento_monto: number;

  /** Monto de impuesto de la línea. */
  detalle_pedido_impuesto_monto: number;

  /** Total de la línea. */
  detalle_pedido_total: number;
}

/**
 * DTO de respuesta para un registro de historial de estado.
 */
export class ResponseHistorialEstadoDto {
  /** ID del registro de historial. */
  historial_id: number;

  /** Estado antes de la transición (nulo en la creación). */
  estado_anterior: PedidoEstado | null;

  /** Estado después de la transición. */
  estado_nuevo: PedidoEstado;

  /** ID del usuario que hizo el cambio. */
  usuario_id: number | null;

  /** Nota asociada al cambio. */
  historial_nota: string | null;

  /** Fecha del cambio. */
  created_at: Date;
}

/**
 * DTO de respuesta para un pedido completo.
 */
export class ResponsePedidoDto {
  /** ID único del pedido. */
  pedido_id: number;

  /** Número de pedido legible. */
  pedido_numero: string;

  /** ID del cliente. */
  cliente_id: number;

  /** ID de la dirección de envío. */
  direccion_envio_id: number | null;

  /** Fecha de negocio del pedido. */
  pedido_fecha: Date;

  /** Notas de la cabecera. */
  pedido_notas: string | null;

  /** Estado actual. */
  pedido_estado: PedidoEstado;

  /** Suma de subtotales de línea. */
  pedido_subtotal: number;

  /** Suma de descuentos de línea. */
  pedido_descuento_total: number;

  /** Suma de impuestos de línea. */
  pedido_impuesto_total: number;

  /** Total del pedido. */
  pedido_total: number;

  /** Versión para concurrencia optimista. */
  pedido_version: number;

  /** ID del usuario que creó el pedido. */
  created_by: number | null;

  /** ID del usuario que modificó el pedido por última vez. */
  updated_by: number | null;

  /** Fecha de creación. */
  created_at: Date;

  /** Fecha de última modificación. */
  updated_at: Date;

  /** Líneas del pedido. */
  detalles: ResponseDetallePedidoDto[];

  /** Historial de cambios de estado (presente en la vista de detalle). */
  historial?: ResponseHistorialEstadoDto[];
}

/**
 * DTO de respuesta paginada para el listado de pedidos.
 */
export class ResponsePedidoPaginadoDto {
  /** Página actual de pedidos. */
  data: ResponsePedidoDto[];

  /** Total de pedidos que cumplen el filtro. */
  total: number;

  /** Página actual (1-based). */
  page: number;

  /** Tamaño de página. */
  limit: number;

  /** Total de páginas. */
  total_paginas: number;
}
