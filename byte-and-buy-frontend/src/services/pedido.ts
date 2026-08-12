import api from "./api";
import { errorDelBackend } from "./errores";
import type {
  CambiarEstadoPedido,
  CreatePedido,
  ListarPedidosParams,
  Pedido,
  PedidoPaginado,
  UpdatePedido,
} from "../ts/interfaces";

/**
 * Crea un pedido en estado BORRADOR.
 *
 * `idempotencyKey` (opcional) viaja en el header `Idempotency-Key`: si la
 * petición se reintenta (doble click, corte de red) el backend devuelve el
 * pedido ya creado en vez de duplicarlo.
 */
export async function crearPedido(
  datos: CreatePedido,
  idempotencyKey?: string,
): Promise<Pedido> {
  try {
    const { data } = await api.post<Pedido>("/pedidos", datos, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    });
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo crear el pedido");
  }
}

/** Lista pedidos con filtros, orden y paginación resueltos en el servidor. */
export async function listarPedidos(
  params: ListarPedidosParams = {},
): Promise<PedidoPaginado> {
  try {
    const { data } = await api.get<PedidoPaginado>("/pedidos", { params });
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar los pedidos");
  }
}

/** Obtiene un pedido con sus líneas e historial de estado. */
export async function obtenerPedido(pedido_id: number): Promise<Pedido> {
  try {
    const { data } = await api.get<Pedido>(`/pedidos/${pedido_id}`);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo cargar el pedido");
  }
}

/** Edita la cabecera y las líneas de un pedido en BORRADOR (concurrencia optimista). */
export async function editarPedido(
  pedido_id: number,
  datos: UpdatePedido,
): Promise<Pedido> {
  try {
    const { data } = await api.put<Pedido>(`/pedidos/${pedido_id}`, datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo guardar el pedido");
  }
}

/** Ejecuta una transición de estado del pedido. */
export async function cambiarEstadoPedido(
  pedido_id: number,
  datos: CambiarEstadoPedido,
): Promise<Pedido> {
  try {
    const { data } = await api.patch<Pedido>(
      `/pedidos/${pedido_id}/estado`,
      datos,
    );
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo cambiar el estado del pedido");
  }
}

/**
 * Alinea el pedido con un pago ya completado (checkout de venta/pago que
 * descuenta el stock por su cuenta, fuera de este módulo): lo deja en
 * CONFIRMADO sin volver a descontar stock, para que una cancelación
 * posterior lo reponga correctamente.
 */
export async function confirmarPagoPedido(pedido_id: number): Promise<Pedido> {
  try {
    const { data } = await api.patch<Pedido>(
      `/pedidos/${pedido_id}/confirmar-pago`,
    );
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo confirmar el pedido tras el pago");
  }
}
