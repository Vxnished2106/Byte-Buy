import { useEffect, useState } from "react";
import { enviarFactura, obtenerFactura } from "../services/factura";
import type { Factura } from "../ts/interfaces";

/**
 * Carga una factura por id y, si todavía no fue enviada por correo
 * (`factura_enviada === false`), dispara el envío automáticamente: en este
 * flujo, llegar a la página de facturación significa que el pedido se
 * acaba de completar, así que el envío del comprobante no depende de una
 * acción manual del usuario.
 *
 * `enviando` distingue el envío automático de la carga inicial, para poder
 * mostrar en la previsualización un aviso distinto ("enviando a tu correo")
 * mientras la factura ya es visible.
 */
export function useFactura(factura_id?: number) {
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!factura_id) {
      setFactura(null);
      setLoading(false);
      return;
    }

    let vigente = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        let actual = await obtenerFactura(factura_id);
        if (!vigente) return;
        setFactura(actual);
        setLoading(false);

        if (!actual.factura_enviada) {
          setEnviando(true);
          actual = await enviarFactura(factura_id);
          if (!vigente) return;
          setFactura(actual);
        }
      } catch (err) {
        if (vigente) {
          setError(
            err instanceof Error ? err.message : "No se pudo cargar la factura",
          );
        }
      } finally {
        if (vigente) {
          setLoading(false);
          setEnviando(false);
        }
      }
    })();

    return () => {
      vigente = false;
    };
  }, [factura_id]);

  return { factura, loading, enviando, error };
}
