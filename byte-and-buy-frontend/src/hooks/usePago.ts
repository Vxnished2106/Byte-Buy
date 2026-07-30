import { useCallback, useState } from "react";
import { registrarDetalleCompra } from "../services/detalleCompra";
import { generarFactura } from "../services/factura";
import { registrarPago } from "../services/pago";
import { registrarVenta } from "../services/venta";
import type { Factura, Pago, Venta } from "../ts/interfaces";

/** Línea del carrito a convertir en detalle de compra de la venta. */
interface ItemCheckout {
  producto_id: number;
  cantidad: number;
}

interface DatosCheckout {
  carrito_id: number;
  /** Monto final a cobrar (subtotal del carrito + envío). */
  monto: number;
  metodo_pago_id: number;
  /** Datos adicionales a guardar junto al pago (ej. últimos 4 dígitos de la tarjeta, correo de PayPal). */
  detalle?: Record<string, unknown>;
  /** Productos del carrito, para registrar el detalle de compra de la venta. */
  items: ItemCheckout[];
}

/**
 * Orquesta el flujo completo de checkout: registra la venta a partir del
 * carrito, registra el pago, registra el detalle de compra (una línea por
 * producto del carrito) y genera la factura. Son llamadas separadas porque
 * así está modelada la API del backend (no existe un único endpoint de
 * "comprar"); el detalle de compra se crea acá, y no en el backend al
 * registrar la venta, porque `POST /ventas/registrar` no recibe los
 * productos del carrito.
 *
 * El pago es simulado: no se valida si la tarjeta es real (Luhn) ni su marca
 * (eso quedó fuera a propósito), solo el formato de los datos ingresados
 * (a cargo de quien llama a `pagar`, antes de invocarlo).
 */
export function usePago() {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagar = useCallback(
    async (
      datos: DatosCheckout,
    ): Promise<{ venta: Venta; pago: Pago; factura: Factura }> => {
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

        for (const item of datos.items) {
          await registrarDetalleCompra({
            venta_id: venta.venta_id,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
          });
        }

        const factura = await generarFactura({
          venta_id: venta.venta_id,
          pago_id: pago.pago_id,
        });

        return { venta, pago, factura };
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
