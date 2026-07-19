import { useCallback, useState } from "react";
import { registrarPago } from "../services/pago";
import { registrarVenta } from "../services/venta";
import type { Pago, Venta } from "../ts/interfaces";

interface DatosCheckout {
  carrito_id: number;
  /** Monto final a cobrar (subtotal del carrito + envío). */
  monto: number;
  metodo_pago_id: number;
  /** Datos adicionales a guardar junto al pago (ej. últimos 4 dígitos de la tarjeta, correo de PayPal). */
  detalle?: Record<string, unknown>;
}

/**
 * Orquesta el flujo de checkout: registra la venta a partir del carrito y
 * luego registra el pago de esa venta. Son dos llamadas separadas porque así
 * está modelada la API del backend (no existe un único endpoint de
 * "comprar").
 *
 * El pago es simulado: no se valida si la tarjeta es real (Luhn) ni su marca
 * (eso quedó fuera a propósito), solo el formato de los datos ingresados
 * (a cargo de quien llama a `pagar`, antes de invocarlo).
 */
export function usePago() {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagar = useCallback(
    async (datos: DatosCheckout): Promise<{ venta: Venta; pago: Pago }> => {
      setProcesando(true);
      setError(null);
      try {
        const venta = await registrarVenta({
          carrito_id: datos.carrito_id,
          venta_monto: datos.monto,
        });

        const pago = await registrarPago({
          venta_id: venta.venta_id,
          metodo_pago_id: datos.metodo_pago_id,
          pago_monto: datos.monto,
          pago_detalle: datos.detalle,
        });

        return { venta, pago };
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo procesar el pago");
        throw err;
      } finally {
        setProcesando(false);
      }
    },
    [],
  );

  return { pagar, procesando, error };
}
