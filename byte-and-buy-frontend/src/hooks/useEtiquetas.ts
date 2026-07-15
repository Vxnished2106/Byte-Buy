import { useCallback, useEffect, useState } from "react";
import { crearEtiqueta, listarEtiquetas } from "../services/etiqueta";
import type { CreateEtiqueta, Etiqueta } from "../ts/interfaces";

/**
 * Carga las etiquetas y expone la acción de creación. El backend no
 * expone un endpoint de edición para etiquetas, solo listar y crear.
 */
export function useEtiquetas() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEtiquetas(await listarEtiquetas());
    } catch {
      setError("No se pudieron cargar las etiquetas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = useCallback(
    async (datos: CreateEtiqueta) => {
      await crearEtiqueta(datos);
      await cargar();
    },
    [cargar],
  );

  return { etiquetas, loading, error, crear, recargar: cargar };
}
