import api from "./api";
import type {
  CreateProveedor,
  Proveedor,
  ProveedorEstado,
  UpdateProveedor,
} from "../ts/interfaces";

/** Lista los proveedores registrados; admite filtros opcionales por nombre y estado. */
export async function listarProveedores(filtros?: {
  nombre?: string;
  estado?: ProveedorEstado;
}): Promise<Proveedor[]> {
  const { data } = await api.get<Proveedor[]>("/proveedores", {
    params: filtros,
  });
  return data;
}

/** Registra un nuevo proveedor (nace con estado activo). */
export async function crearProveedor(
  datos: CreateProveedor,
): Promise<Proveedor> {
  const { data } = await api.post<Proveedor>("/proveedores", datos);
  return data;
}

/** Edita los datos de un proveedor existente. */
export async function editarProveedor(
  proveedor_id: number,
  datos: UpdateProveedor,
): Promise<Proveedor> {
  const { data } = await api.patch<Proveedor>(
    `/proveedores/${proveedor_id}`,
    datos,
  );
  return data;
}

/** Activa o desactiva un proveedor (alterna su estado actual). */
export async function cambiarEstadoProveedor(
  proveedor_id: number,
): Promise<Proveedor> {
  const { data } = await api.patch<Proveedor>(
    `/proveedores/${proveedor_id}/estado`,
  );
  return data;
}
