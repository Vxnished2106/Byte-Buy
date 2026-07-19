import { useCallback, useEffect, useState } from "react";
import { listarMetodosPago } from "../services/metodoPago";
import type { MetodoPago } from "../ts/interfaces";

/** Carga los métodos de pago disponibles (usado en el checkout). */
export function useMetodosPago() {
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMetodos(await listarMetodosPago());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los métodos de pago",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { metodos, loading, error, recargar: cargar };
}
