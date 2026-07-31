import { useCallback, useEffect, useState } from "react";
import { obtenerPedido } from "../services/pedido";
import type { Pedido } from "../ts/interfaces";

/**
 * Carga un pedido por id (con líneas e historial). Expone `recargar` para
 * refrescar tras una transición de estado, de modo que la vista siempre use
 * la versión más reciente (`pedido_version`) para la siguiente acción.
 */
export function usePedido(pedido_id?: number) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!pedido_id) {
      setPedido(null);
      setLoading(false);
      return;
    }
    let vigente = true;
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerPedido(pedido_id);
      if (vigente) setPedido(data);
    } catch (err) {
      if (vigente) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el pedido");
      }
    } finally {
      if (vigente) setLoading(false);
    }
    return () => {
      vigente = false;
    };
  }, [pedido_id]);

  useEffect(() => {
    const cleanup = cargar();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [cargar]);

  return { pedido, loading, error, recargar: cargar };
}
