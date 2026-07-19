import type { CarritoItem } from "../ts/interfaces";

/** Costo de envío fijo cuando no aplica el envío gratis. */
const COSTO_ENVIO = 15;
/** Cantidad mínima de unidades en el carrito para que el envío sea gratis. */
const UNIDADES_PARA_ENVIO_GRATIS = 3;

/**
 * Calcula el costo de envío a partir de la cantidad total de unidades en el
 * carrito. Es una regla puramente del frontend (el backend no modela el
 * envío), así que tanto el carrito como el pago deben usar esta misma
 * función para que el monto mostrado y el monto cobrado coincidan.
 */
export function calcularCostoEnvio(items: CarritoItem[]): number {
  const unidades = items.reduce((total, item) => total + item.cantidad, 0);
  return unidades === 0 || unidades >= UNIDADES_PARA_ENVIO_GRATIS
    ? 0
    : COSTO_ENVIO;
}
