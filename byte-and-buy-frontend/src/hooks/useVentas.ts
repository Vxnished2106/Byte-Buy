import { useCallback, useEffect, useState } from "react";
import { listarMisVentas } from "../services/venta";
import type { Venta } from "../ts/interfaces";

/** Carga el historial de compras (ventas) del usuario autenticado. */
export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVentas(await listarMisVentas());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar tus compras");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { ventas, loading, error, recargar: cargar };
}
