/** Costo de envío fijo cuando no aplica el envío gratis. */
const COSTO_ENVIO = 15;
/** Cantidad mínima de unidades en el carrito para que el envío sea gratis. */
const UNIDADES_PARA_ENVIO_GRATIS = 3;

/**
 * Calcula el costo de envío a partir de la cantidad total de unidades. Es una
 * regla puramente del frontend (el backend no modela el envío), así que el
 * carrito, el pago y la finalización de un pedido deben usar esta misma
 * función para que el monto mostrado y el monto cobrado coincidan. Recibe
 * cualquier lista con `cantidad` (líneas de carrito o de pedido).
 */
export function calcularCostoEnvio(items: { cantidad: number }[]): number {
  const unidades = items.reduce((total, item) => total + item.cantidad, 0);
  return unidades === 0 || unidades >= UNIDADES_PARA_ENVIO_GRATIS
    ? 0
    : COSTO_ENVIO;
}
