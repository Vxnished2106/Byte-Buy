import { useEffect, useState } from "react";
import { listarProductos } from "../services/producto";

export interface CategoriaConteo {
  nombre: string;
  cantidad: number;
}

/**
 * Deriva, a partir del catálogo público de productos, las categorías
 * disponibles y cuántos productos activos tiene cada una (usado por el
 * menú desplegable "Catalogo" del Header).
 */
export function useCategoriasCatalogo() {
  const [categorias, setCategorias] = useState<CategoriaConteo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vigente = true;

    listarProductos()
      .then((productos) => {
        if (!vigente) return;
        const conteo = new Map<string, number>();
        productos.forEach((producto) => {
          producto.categorias.forEach((categoria) => {
            conteo.set(
              categoria.categoria_nombre,
              (conteo.get(categoria.categoria_nombre) ?? 0) + 1,
            );
          });
        });
        setCategorias(
          Array.from(conteo, ([nombre, cantidad]) => ({ nombre, cantidad })),
        );
        setTotal(productos.length);
      })
      .catch(() => {
        if (vigente) {
          setCategorias([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  return { categorias, total, loading };
}
