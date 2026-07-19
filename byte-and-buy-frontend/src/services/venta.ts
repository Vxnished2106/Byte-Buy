import axios from "axios";
import api from "./api";
import type { CreateVenta, UpdateVenta, Venta } from "../ts/interfaces";

function errorDelBackend(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message;
    if (mensaje) return new Error(Array.isArray(mensaje) ? mensaje[0] : mensaje);
  }
  return new Error(fallback);
}

/**
 * Registra una venta a partir del carrito actual. El backend resuelve el
 * `usuario_id` desde el token de sesión: no se envía desde el frontend.
 */
export async function registrarVenta(datos: CreateVenta): Promise<Venta> {
  try {
    const { data } = await api.post<Venta>("/ventas/registrar", datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo registrar la venta");
  }
}

/** Obtiene una venta por id. */
export async function obtenerVenta(venta_id: number): Promise<Venta> {
  try {
    const { data } = await api.get<Venta>(`/ventas/${venta_id}`);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo cargar la venta");
  }
}

/** Lista las ventas del usuario autenticado. */
export async function listarMisVentas(): Promise<Venta[]> {
  try {
    const { data } = await api.get<Venta[]>("/ventas/usuario/mis-ventas");
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar tus compras");
  }
}

/** Edita una venta (ej. cambiar su estado). */
export async function editarVenta(
  venta_id: number,
  datos: UpdateVenta,
): Promise<Venta> {
  try {
    const { data } = await api.patch<Venta>(`/ventas/${venta_id}`, datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo editar la venta");
  }
}
