import { useCallback, useEffect, useState } from "react";
import { obtenerAlertasStock } from "../services/inventario";
import type { Inventario } from "../ts/interfaces";

/** Carga los productos cuyo stock actual llegó o bajó del mínimo configurado. */
export function useAlertasStock() {
  const [alertas, setAlertas] = useState<Inventario[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerAlertasStock();
      setAlertas(data);
    } catch {
      setAlertas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { alertas, loading, recargar: cargar };
}
