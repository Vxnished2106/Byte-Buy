import axios from "axios";
import api from "./api";
import type {
  ActualizarItemCarrito,
  AgregarItemCarrito,
  Carrito,
} from "../ts/interfaces";

function errorDelBackend(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message;
    if (mensaje) return new Error(Array.isArray(mensaje) ? mensaje[0] : mensaje);
  }
  return new Error(fallback);
}

/** Obtiene el carrito del usuario autenticado (el backend lo crea si aún no existe). */
export async function obtenerCarrito(): Promise<Carrito> {
  try {
    const { data } = await api.get<Carrito>("/carrito");
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo cargar el carrito");
  }
}

/**
 * Agrega un producto al carrito (o suma la cantidad si ya estaba agregado).
 *
 * OJO: `POST /carrito/items`, `PUT /carrito/items/:producto_id` y
 * `DELETE /carrito/items/:producto_id` devuelven la entidad `Carrito` cruda
 * de TypeORM (sin subtotales calculados), a diferencia de `GET /carrito`
 * que devuelve `ResponseCarritoDto`. Para no manejar dos formas distintas
 * de carrito en el frontend, estas funciones no usan esa respuesta: quien
 * las llama debe volver a pedir `obtenerCarrito()` para refrescar el estado.
 */
export async function agregarItemCarrito(
  datos: AgregarItemCarrito,
): Promise<void> {
  try {
    await api.post("/carrito/items", datos);
  } catch (error) {
    throw errorDelBackend(error, "No se pudo agregar el producto al carrito");
  }
}

/** Reemplaza la cantidad de un producto ya presente en el carrito. */
export async function actualizarItemCarrito(
  producto_id: number,
  datos: ActualizarItemCarrito,
): Promise<void> {
  try {
    await api.put(`/carrito/items/${producto_id}`, datos);
  } catch (error) {
    throw errorDelBackend(error, "No se pudo actualizar la cantidad");
  }
}

/** Quita un producto del carrito. */
export async function eliminarItemCarrito(producto_id: number): Promise<void> {
  try {
    await api.delete(`/carrito/items/${producto_id}`);
  } catch (error) {
    throw errorDelBackend(error, "No se pudo quitar el producto del carrito");
  }
}
