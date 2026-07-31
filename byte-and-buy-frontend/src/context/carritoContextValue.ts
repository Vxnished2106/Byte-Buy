import { createContext } from "react";
import type { Carrito } from "../ts/interfaces";

/**
 * Tipo de valor que contiene el contexto del carrito.
 */
export interface CarritoContextValue {
  /** `null` mientras carga o si no hay sesión iniciada. */
  carrito: Carrito | null;
  /** Indica si el carrito se está cargando. */
  loading: boolean;
  /** Mensaje de error si hubo un problema al cargar/modificar el carrito. */
  error: string | null;
  /**
   * `producto_id` al que pertenece `error`, cuando viene de agregar/cambiar
   * cantidad/eliminar un item puntual. `null` cuando el error es general
   * (ej. no se pudo cargar el carrito) y no hay un item al que asociarlo.
   */
  errorProductoId: number | null;
  /** Suma de las cantidades de todos los items; para la burbuja del header. */
  cantidadTotal: number;
  /** `producto_id` del item que tiene una mutación en curso, o `null`. */
  actualizandoProductoId: number | null;
  /** Recarga el carrito desde el servidor. */
  recargar: () => Promise<void>;
  /** Agrega un producto al carrito. */
  agregarProducto: (producto_id: number, cantidad?: number) => Promise<void>;
  /** Cambia la cantidad de un producto en el carrito. */
  cambiarCantidad: (producto_id: number, cantidad: number) => Promise<void>;
  /** Elimina un producto del carrito. */
  eliminarProducto: (producto_id: number) => Promise<void>;
  /** Limpia el mensaje de error (ej. al salir de la página que lo mostró). */
  limpiarError: () => void;
}

/**
 * Contexto del carrito de compras.
 * Separado en su propio archivo (sin componentes) para que Fast Refresh no
 * se rompa: un archivo que mezcla un `Context` con un componente exportado
 * pierde el hot-reload de ese componente.
 */
export const CarritoContext = createContext<CarritoContextValue | null>(null);
