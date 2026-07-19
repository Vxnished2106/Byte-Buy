import axios from "axios";
import api from "./api";
import type {
  CreatePago,
  Pago,
  ResultadoValidacionPago,
  UpdatePago,
  ValidarPago,
} from "../ts/interfaces";

function errorDelBackend(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message;
    if (mensaje) return new Error(Array.isArray(mensaje) ? mensaje[0] : mensaje);
  }
  return new Error(fallback);
}

/**
 * Valida los datos de una tarjeta (número, marca, CVV, vigencia) sin cobrar
 * ni registrar nada. Lanza si la tarjeta no es válida; el mensaje del
 * backend ya viene listo para mostrar al usuario.
 */
export async function validarPago(
  datos: ValidarPago,
): Promise<ResultadoValidacionPago> {
  try {
    const { data } = await api.post<ResultadoValidacionPago>(
      "/pagos/validar",
      datos,
    );
    return data;
  } catch (error) {
    throw errorDelBackend(error, "La tarjeta no es válida");
  }
}

/** Registra el pago de una venta ya creada. */
export async function registrarPago(datos: CreatePago): Promise<Pago> {
  try {
    const { data } = await api.post<Pago>("/pagos/registrar", datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo registrar el pago");
  }
}

/** Obtiene un pago por id. */
export async function obtenerPago(pago_id: number): Promise<Pago> {
  try {
    const { data } = await api.get<Pago>(`/pagos/${pago_id}`);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo cargar el pago");
  }
}

/** Lista los pagos asociados a una venta. */
export async function listarPagosPorVenta(venta_id: number): Promise<Pago[]> {
  try {
    const { data } = await api.get<Pago[]>(`/pagos/venta/${venta_id}`);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar los pagos de la venta");
  }
}

/** Edita un pago (ej. cambiar su estado). */
export async function editarPago(
  pago_id: number,
  datos: UpdatePago,
): Promise<Pago> {
  try {
    const { data } = await api.patch<Pago>(`/pagos/${pago_id}`, datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo editar el pago");
  }
}
