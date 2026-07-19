import type { CarritoItem } from "./carritoItem.interface";

/**
 * Carrito del usuario autenticado tal como lo entrega `GET /carrito`
 * (`ResponseCarritoDto` del backend). El backend mantiene un solo carrito
 * por usuario (se crea automáticamente si aún no existe).
 */
export interface Carrito {
  carrito_id: number;
  items: CarritoItem[];
  /** Suma de los subtotales de todos los items. */
  total: number;
}
