import { useCallback, useEffect, useState } from "react";
import { listarProductos, obtenerCatalogo } from "../services/producto";
import type { Producto } from "../ts/interfaces";

/**
 * Carga el catálogo público de productos (activos) para la página de
 * Productos, ocultando los que no tienen stock disponible (se combina con
 * `GET /productos/catalogo`, que es el único endpoint público que expone
 * disponibilidad de stock).
 */
export function useCatalogoProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lista, catalogo] = await Promise.all([
        listarProductos(),
        obtenerCatalogo(),
      ]);
      const disponibles = new Set(
        catalogo.filter((p) => p.disponible).map((p) => p.producto_id),
      );
      setProductos(lista.filter((p) => disponibles.has(p.producto_id)));
    } catch {
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { productos, loading, error, recargar: cargar };
}
