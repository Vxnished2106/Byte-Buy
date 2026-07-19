import { createContext } from "react";
import type { Carrito } from "../ts/interfaces";

export interface CarritoContextValue {
  /** `null` mientras carga o si no hay sesión iniciada. */
  carrito: Carrito | null;
  loading: boolean;
  error: string | null;
  /** Suma de las cantidades de todos los items; para la burbuja del header. */
  cantidadTotal: number;
  /** `producto_id` del item que tiene una mutación en curso, o `null`. */
  actualizandoProductoId: number | null;
  recargar: () => Promise<void>;
  agregarProducto: (producto_id: number, cantidad?: number) => Promise<void>;
  cambiarCantidad: (producto_id: number, cantidad: number) => Promise<void>;
  eliminarProducto: (producto_id: number) => Promise<void>;
}

/**
 * Contexto en su propio archivo (sin componentes) para que Fast Refresh no
 * se rompa: un archivo que mezcla un `Context` con un componente exportado
 * pierde el hot-reload de ese componente.
 */
export const CarritoContext = createContext<CarritoContextValue | null>(null);
