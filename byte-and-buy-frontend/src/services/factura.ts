import api from "./api";
import { errorDelBackend } from "./errores";
import type { CreateFactura, Factura, UpdateFactura } from "../ts/interfaces";

/**
 * Genera la factura de una venta ya pagada. Falla si la venta no tiene
 * detalles de compra registrados, si el pago no le pertenece o si ya
 * existía una factura para esa venta.
 */
export async function generarFactura(datos: CreateFactura): Promise<Factura> {
  try {
    const { data } = await api.post<Factura>("/facturas", datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo generar la factura");
  }
}

/**
 * Genera el PDF de la factura y lo envía al correo del cliente. Al
 * completarse, el backend marca `factura_enviada` en `true`.
 */
export async function enviarFactura(factura_id: number): Promise<Factura> {
  try {
    const { data } = await api.post<Factura>(`/facturas/${factura_id}/enviar`);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo enviar la factura por correo");
  }
}

/** Obtiene una factura por id. */
export async function obtenerFactura(factura_id: number): Promise<Factura> {
  try {
    const { data } = await api.get<Factura>(`/facturas/${factura_id}`);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo cargar la factura");
  }
}

/** Lista las facturas asociadas a una venta. */
export async function listarFacturasPorVenta(
  venta_id: number,
): Promise<Factura[]> {
  try {
    const { data } = await api.get<Factura[]>(`/facturas/venta/${venta_id}`);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar las facturas de la venta");
  }
}

/** Edita una factura (ej. cambiar su estado). */
export async function editarFactura(
  factura_id: number,
  datos: UpdateFactura,
): Promise<Factura> {
  try {
    const { data } = await api.patch<Factura>(`/facturas/${factura_id}`, datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo editar la factura");
  }
}
