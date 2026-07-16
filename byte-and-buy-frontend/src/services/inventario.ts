import api from "./api";
import type { CreateInventario, Inventario, UpdateInventario } from "../ts/interfaces";

/** Lista el inventario completo (todos los productos), ordenado por stock ascendente. */
export async function listarInventario(): Promise<Inventario[]> {
  const { data } = await api.get<Inventario[]>("/inventarios");
  return data;
}

/** Lista los productos cuyo stock actual llegó o bajó del mínimo configurado. */
export async function obtenerAlertasStock(): Promise<Inventario[]> {
  const { data } = await api.get<Inventario[]>("/inventarios/alertas-stock");
  return data;
}

/** Crea el registro de inventario de un producto. */
export async function crearInventario(
  datos: CreateInventario,
): Promise<Inventario> {
  const { data } = await api.post<Inventario>("/inventarios", datos);
  return data;
}

/** Edita el stock actual y/o mínimo de un inventario existente. */
export async function editarInventario(
  inventario_id: number,
  datos: UpdateInventario,
): Promise<Inventario> {
  const { data } = await api.patch<Inventario>(
    `/inventarios/${inventario_id}`,
    datos,
  );
  return data;
}
