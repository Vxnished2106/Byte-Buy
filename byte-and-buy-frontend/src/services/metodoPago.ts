import axios from "axios";
import api from "./api";
import type { CreateMetodoPago, MetodoPago, UpdateMetodoPago } from "../ts/interfaces";

function errorDelBackend(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message;
    if (mensaje) return new Error(Array.isArray(mensaje) ? mensaje[0] : mensaje);
  }
  return new Error(fallback);
}

/** Lista los métodos de pago disponibles (usado en el checkout y el panel admin). */
export async function listarMetodosPago(): Promise<MetodoPago[]> {
  try {
    const { data } = await api.get<MetodoPago[]>("/metodos-pago");
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar los métodos de pago");
  }
}

/** Obtiene un método de pago por id. */
export async function obtenerMetodoPago(
  metodo_pago_id: number,
): Promise<MetodoPago> {
  try {
    const { data } = await api.get<MetodoPago>(
      `/metodos-pago/${metodo_pago_id}`,
    );
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo cargar el método de pago");
  }
}

/** Registra un nuevo método de pago (gestión desde el panel admin). */
export async function crearMetodoPago(
  datos: CreateMetodoPago,
): Promise<MetodoPago> {
  try {
    const { data } = await api.post<MetodoPago>("/metodos-pago", datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo crear el método de pago");
  }
}

/** Edita un método de pago existente. */
export async function editarMetodoPago(
  metodo_pago_id: number,
  datos: UpdateMetodoPago,
): Promise<MetodoPago> {
  try {
    const { data } = await api.patch<MetodoPago>(
      `/metodos-pago/${metodo_pago_id}`,
      datos,
    );
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo editar el método de pago");
  }
}

/** Elimina un método de pago. */
export async function eliminarMetodoPago(
  metodo_pago_id: number,
): Promise<void> {
  try {
    await api.delete(`/metodos-pago/${metodo_pago_id}`);
  } catch (error) {
    throw errorDelBackend(error, "No se pudo eliminar el método de pago");
  }
}
