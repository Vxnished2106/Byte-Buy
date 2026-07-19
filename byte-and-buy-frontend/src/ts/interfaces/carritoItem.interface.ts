/**
 * Item del carrito tal como lo entrega `GET /carrito` (`ResponseCarritoItemDto`
 * del backend). Ya viene con los porcentajes de descuento/impuesto aplicados
 * sobre el precio unitario, y el subtotal (`precio_final_unitario * cantidad`)
 * calculado en el servidor.
 */
export interface CarritoItem {
  producto_id: number;
  producto_nombre: string;
  /** Precio de lista del producto, sin descuento ni impuesto. */
  precio_unitario: number;
  /** Porcentaje de descuento aplicado (ej. 10 = 10%). */
  descuento: number;
  /** Porcentaje de impuesto aplicado (ej. 13 = 13%). */
  impuesto: number;
  /** Precio unitario ya con descuento e impuesto aplicados. */
  precio_final_unitario: number;
  cantidad: number;
  /** precio_final_unitario * cantidad. */
  subtotal: number;
}

/** Datos para agregar un producto al carrito (`POST /carrito/items`). */
export interface AgregarItemCarrito {
  producto_id: number;
  cantidad: number;
}

/** Datos para cambiar la cantidad de un item ya en el carrito (`PUT /carrito/items/:producto_id`). */
export interface ActualizarItemCarrito {
  cantidad: number;
}
