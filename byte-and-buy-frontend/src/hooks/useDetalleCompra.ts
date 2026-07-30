import { useEffect, useState } from "react";
import { listarDetallePorVenta } from "../services/detalleCompra";
import type { DetalleCompra } from "../ts/interfaces";

/** Carga las líneas de producto (detalle de compra) de una venta. */
export function useDetalleCompra(venta_id?: number) {
  const [detalles, setDetalles] = useState<DetalleCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!venta_id) {
      setDetalles([]);
      setLoading(false);
      return;
    }

    let vigente = true;
    setLoading(true);
    setError(null);

    listarDetallePorVenta(venta_id)
      .then((data) => {
        if (vigente) setDetalles(data);
      })
      .catch((err) => {
        if (vigente) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los productos de la compra",
          );
        }
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    return () => {
      vigente = false;
    };
  }, [venta_id]);

  return { detalles, loading, error };
}
