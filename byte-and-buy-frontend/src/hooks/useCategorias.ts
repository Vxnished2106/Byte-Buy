import { useCallback, useEffect, useState } from "react";
import { crearCategoria, listarCategorias } from "../services/categoria";
import type { Categoria, CreateCategoria } from "../ts/interfaces";

/**
 * Carga las categorías y expone la acción de creación. El backend no
 * expone un endpoint de edición para categorías, solo listar y crear.
 */
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategorias(await listarCategorias());
    } catch {
      setError("No se pudieron cargar las categorias");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = useCallback(
    async (datos: CreateCategoria, imagen?: File) => {
      await crearCategoria(datos, imagen);
      await cargar();
    },
    [cargar],
  );

  return { categorias, loading, error, crear, recargar: cargar };
}
