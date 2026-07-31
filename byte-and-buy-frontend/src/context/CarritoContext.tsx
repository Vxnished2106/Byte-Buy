import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  actualizarItemCarrito,
  agregarItemCarrito,
  eliminarItemCarrito,
  obtenerCarrito,
} from "../services/carrito";
import { useSesion } from "../hooks/useSesion";
import type { Carrito } from "../ts/interfaces";
import { CarritoContext } from "./carritoContextValue";

/**
 * Proveedor de contexto del carrito de compras.
 * Mantiene el carrito del usuario autenticado en un solo lugar, para que el
 * header (burbuja de cantidad), el catálogo (botón "Agregar al carrito") y
 * la página del carrito siempre muestren el mismo estado sin tener que
 * volver a montarse entre ellos.
 *
 * @param children Componentes hijos que tendrán acceso al contexto.
 */
export function CarritoProvider({ children }: { children: ReactNode }) {
  const { session, loading: sesionCargando } = useSesion();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Producto al que pertenece `error`, cuando viene de agregar/cambiar
  // cantidad/eliminar (para mostrarlo en su card en vez de a nivel página).
  // `null` cuando el error es general (ej. no se pudo cargar el carrito).
  const [errorProductoId, setErrorProductoId] = useState<number | null>(null);
  const [actualizandoProductoId, setActualizandoProductoId] = useState<
    number | null
  >(null);

  const recargar = useCallback(async () => {
    if (!session) {
      setCarrito(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setErrorProductoId(null);
    try {
      setCarrito(await obtenerCarrito());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el carrito");
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Carga el carrito al iniciar sesión y lo limpia al cerrarla.
  useEffect(() => {
    if (sesionCargando) return;
    recargar();
  }, [sesionCargando, recargar]);

  const agregarProducto = useCallback(
    async (producto_id: number, cantidad = 1) => {
      setActualizandoProductoId(producto_id);
      setError(null);
      setErrorProductoId(null);
      try {
        await agregarItemCarrito({ producto_id, cantidad });
        await recargar();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo agregar el producto",
        );
        setErrorProductoId(producto_id);
        throw err;
      } finally {
        setActualizandoProductoId(null);
      }
    },
    [recargar],
  );

  const cambiarCantidad = useCallback(
    async (producto_id: number, cantidad: number) => {
      setActualizandoProductoId(producto_id);
      setError(null);
      setErrorProductoId(null);
      try {
        await actualizarItemCarrito(producto_id, { cantidad });
        await recargar();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo actualizar la cantidad",
        );
        setErrorProductoId(producto_id);
        throw err;
      } finally {
        setActualizandoProductoId(null);
      }
    },
    [recargar],
  );

  const eliminarProducto = useCallback(
    async (producto_id: number) => {
      setActualizandoProductoId(producto_id);
      setError(null);
      setErrorProductoId(null);
      try {
        await eliminarItemCarrito(producto_id);
        await recargar();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo quitar el producto",
        );
        setErrorProductoId(producto_id);
        throw err;
      } finally {
        setActualizandoProductoId(null);
      }
    },
    [recargar],
  );

  const limpiarError = useCallback(() => {
    setError(null);
    setErrorProductoId(null);
  }, []);

  const cantidadTotal =
    carrito?.items.reduce((total, item) => total + item.cantidad, 0) ?? 0;

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        loading,
        error,
        errorProductoId,
        cantidadTotal,
        actualizandoProductoId,
        recargar,
        agregarProducto,
        cambiarCantidad,
        eliminarProducto,
        limpiarError,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}
