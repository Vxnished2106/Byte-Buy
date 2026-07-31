import { useCallback, useEffect, useState } from "react";
import { listarPedidos } from "../services/pedido";
import type { ListarPedidosParams, PedidoPaginado } from "../ts/interfaces";

const VACIO: PedidoPaginado = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
  total_paginas: 0,
};

/**
 * Carga el listado de pedidos con filtros, orden y paginación server-side.
 *
 * Vuelve a consultar cuando cambia cualquier parámetro (se serializa a JSON
 * para comparar por valor y no por identidad del objeto). Expone `recargar`
 * para refrescar tras una acción (ej. cancelar un pedido desde el listado).
 */
export function useListaPedidos(params: ListarPedidosParams) {
  const [resultado, setResultado] = useState<PedidoPaginado>(VACIO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clave = JSON.stringify(params);

  const cargar = useCallback(async () => {
    let vigente = true;
    setLoading(true);
    setError(null);
    try {
      const data = await listarPedidos(params);
      if (vigente) setResultado(data);
    } catch (err) {
      if (vigente) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los pedidos");
      }
    } finally {
      if (vigente) setLoading(false);
    }
    return () => {
      vigente = false;
    };
    // `clave` representa el valor de `params`; evita recrear la función en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useEffect(() => {
    const cleanup = cargar();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [cargar]);

  return {
    pedidos: resultado.data,
    total: resultado.total,
    page: resultado.page,
    limit: resultado.limit,
    totalPaginas: resultado.total_paginas,
    loading,
    error,
    recargar: cargar,
  };
}
