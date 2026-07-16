import api from "./api";
import type { AsignarProveedor, ProductoProveedor } from "../ts/interfaces";

/** Lista los proveedores asignados a un producto. */
export async function listarProveedoresPorProducto(
  producto_id: number,
): Promise<ProductoProveedor[]> {
  const { data } = await api.get<ProductoProveedor[]>(
    `/producto-proveedor/producto/${producto_id}`,
  );
  return data;
}

/** Asigna un proveedor a un producto (con su precio de compra). */
export async function asignarProveedor(
  datos: AsignarProveedor,
): Promise<ProductoProveedor> {
  const { data } = await api.post<ProductoProveedor>(
    "/producto-proveedor/asignar",
    datos,
  );
  return data;
}

/** Actualiza el precio de compra de una asignación producto-proveedor existente. */
export async function actualizarPrecioCompra(
  producto_proveedor_id: number,
  nuevoPrecio: number,
): Promise<ProductoProveedor> {
  const { data } = await api.patch<ProductoProveedor>(
    `/producto-proveedor/${producto_proveedor_id}/precio`,
    { nuevoPrecio },
  );
  return data;
}

/** Elimina la asignación de un proveedor a un producto. */
export async function eliminarAsignacionProveedor(
  producto_proveedor_id: number,
): Promise<void> {
  await api.delete(`/producto-proveedor/${producto_proveedor_id}`);
}
