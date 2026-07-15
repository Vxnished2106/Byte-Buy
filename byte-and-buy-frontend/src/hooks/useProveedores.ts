import { useCallback, useEffect, useState } from "react";
import {
  cambiarEstadoProveedor,
  crearProveedor,
  editarProveedor,
  listarProveedores,
} from "../services/proveedor";
import type {
  CreateProveedor,
  Proveedor,
  proveedorData,
  UpdateProveedor,
} from "../ts/interfaces";

function toRow(proveedor: Proveedor): proveedorData {
  return {
    proveedor_id: proveedor.proveedor_id,
    proveedor_nombre: proveedor.proveedor_nombre,
    proveedor_correo: proveedor.proveedor_correo ?? "",
    proveedor_telefono: proveedor.proveedor_telefono ?? "",
    proveedor_direccion: proveedor.proveedor_direccion ?? "",
    proveedor_estado: proveedor.proveedor_estado === "activo",
  };
}

/**
 * Carga los proveedores desde el backend y expone las acciones de
 * creación, edición y cambio de estado, refrescando la lista tras cada una.
 */
export function useProveedores() {
  const [proveedores, setProveedores] = useState<proveedorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lista = await listarProveedores();
      setProveedores(lista.map(toRow));
    } catch {
      setError("No se pudieron cargar los proveedores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = useCallback(
    async (proveedor_id: number, datos: CreateProveedor | UpdateProveedor) => {
      if (proveedor_id) {
        await editarProveedor(proveedor_id, datos);
      } else {
        await crearProveedor(datos as CreateProveedor);
      }
      await cargar();
    },
    [cargar],
  );

  const cambiarEstado = useCallback(
    async (proveedor_id: number) => {
      await cambiarEstadoProveedor(proveedor_id);
      await cargar();
    },
    [cargar],
  );

  return { proveedores, loading, error, guardar, cambiarEstado, recargar: cargar };
}
