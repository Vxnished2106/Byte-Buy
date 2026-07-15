import { useCallback, useEffect, useState } from "react";
import { listarProductos } from "../services/producto";
import type { Producto } from "../ts/interfaces";

/** Carga el catálogo público de productos (activos) para la página de Productos. */
export function useCatalogoProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lista = await listarProductos();
      setProductos(lista);
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
