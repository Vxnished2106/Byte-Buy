import { useEffect, useState } from "react";
import { obtenerDetalleProducto } from "../services/producto";
import type { DetalleProducto } from "../ts/interfaces";

/** Carga el detalle público de un producto por su id (para la página de detalle). */
export function useDetalleProducto(producto_id?: number) {
  const [producto, setProducto] = useState<DetalleProducto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!producto_id) {
      setProducto(null);
      setLoading(false);
      return;
    }

    let vigente = true;
    setLoading(true);
    setError(null);

    obtenerDetalleProducto(producto_id)
      .then((data) => {
        if (vigente) setProducto(data);
      })
      .catch(() => {
        if (vigente) setError("No se pudo cargar el producto");
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    return () => {
      vigente = false;
    };
  }, [producto_id]);

  return { producto, loading, error };
}
