import { useEffect, useState } from "react";
import { obtenerProductosMasVendidos } from "../services/producto";
import type { ProductoMasVendido } from "../ts/interfaces";

/** Carga los productos con más unidades vendidas, para destacarlos en el home. */
export function useProductosMasVendidos(limit = 4) {
  const [productos, setProductos] = useState<ProductoMasVendido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vigente = true;
    setLoading(true);

    obtenerProductosMasVendidos(limit)
      .then((data) => {
        if (vigente) setProductos(data);
      })
      .catch(() => {
        if (vigente) setProductos([]);
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    return () => {
      vigente = false;
    };
  }, [limit]);

  return { productos, loading };
}
