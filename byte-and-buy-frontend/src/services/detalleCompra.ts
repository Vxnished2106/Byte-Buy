import api from "./api";
import { errorDelBackend } from "./errores";
import type {
  CreateDetalleCompra,
  DetalleCompra,
} from "../ts/interfaces";

/**
 * Registra la línea de un producto dentro de una venta ya creada. El
 * backend calcula subtotal/total a partir del precio, descuento e impuesto
 * vigentes del producto en ese momento.
 */
export async function registrarDetalleCompra(
  datos: CreateDetalleCompra,
): Promise<DetalleCompra> {
  try {
    const { data } = await api.post<DetalleCompra>("/detalle-compra", datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo registrar el detalle de la compra");
  }
}

/** Obtiene un detalle de compra por id. */
export async function obtenerDetalleCompra(
  detalle_compra_id: number,
): Promise<DetalleCompra> {
  try {
    const { data } = await api.get<DetalleCompra>(
      `/detalle-compra/${detalle_compra_id}`,
    );
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo cargar el detalle de la compra");
  }
}

/** Lista todos los detalles (líneas de producto) asociados a una venta. */
export async function listarDetallePorVenta(
  venta_id: number,
): Promise<DetalleCompra[]> {
  try {
    const { data } = await api.get<DetalleCompra[]>(
      `/detalle-compra/venta/${venta_id}`,
    );
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar los productos de la compra");
  }
}
