import { useContext } from "react";
import {
  CarritoContext,
  type CarritoContextValue,
} from "../context/carritoContextValue";

/**
 * Acceso al carrito compartido (estado + acciones) expuesto por
 * `<CarritoProvider>`, que envuelve toda la app en `main.tsx`. Debe usarse
 * dentro de ese provider: lo usan el header (burbuja de cantidad), las
 * tarjetas de producto ("Agregar al carrito") y las páginas de carrito/pago.
 */
export function useCarrito(): CarritoContextValue {
  const contexto = useContext(CarritoContext);
  if (!contexto) {
    throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  }
  return contexto;
}
