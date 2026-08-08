import { useState } from "react";
import { usePedido } from "../hooks/usePedido";
import { cambiarEstadoPedido } from "../services/pedido";
import {
  ETIQUETA_ESTADO,
  formatearMonto,
  transicionesDesde,
} from "../ts/pedidoReglas";
import type { PedidoEstado } from "../ts/interfaces";
import "../styles/pedidos.css";
import "../styles/modal-form.css";

export interface PedidoEstadoModalProps {
  pedidoId: number;
  onClose: () => void;
  /** Se dispara tras un cambio de estado exitoso, para que el panel de admin refresque su listado. */
  onCambiado: () => void;
}

/**
 * Modal de administración: muestra el detalle de un pedido (líneas +
 * historial) y permite ejecutar transiciones de estado. Es la versión para
 * admin de las "Acciones de estado" de `PedidoDetalle.tsx`, reutilizando la
 * misma lógica y endpoint (el backend ya permite que un admin opere
 * cualquier pedido, no solo el propio).
 */
export default function PedidoEstadoModal({
  pedidoId,
  onClose,
  onCambiado,
}: PedidoEstadoModalProps) {
  const { pedido, loading, error, recargar } = usePedido(pedidoId);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const ejecutarTransicion = async (nuevo: PedidoEstado) => {
    if (!pedido || enviando) return;
    if (
      nuevo === "CANCELADO" &&
      !window.confirm("¿Seguro que deseas cancelar este pedido?")
    ) {
      return;
    }
    setEnviando(true);
    setErrorAccion(null);
    try {
      await cambiarEstadoPedido(pedido.pedido_id, {
        nuevo_estado: nuevo,
        pedido_version: pedido.pedido_version,
        nota: nota || undefined,
      });
      setNota("");
      await recargar();
      onCambiado();
    } catch (err) {
      setErrorAccion(
        err instanceof Error ? err.message : "No se pudo cambiar el estado",
      );
    } finally {
      setEnviando(false);
    }
  };

  const transiciones = pedido ? transicionesDesde(pedido.pedido_estado) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-form-content pedido-estado-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-form-header">
          <h2>{pedido ? pedido.pedido_numero : "Pedido"}</h2>
          <button
            type="button"
            className="modal-form-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        {loading && <p className="admin-status-message">Cargando pedido...</p>}
        {error && (
          <p className="admin-status-message admin-status-error">{error}</p>
        )}

        {pedido && (
          <>
            <section className="pedido-detalle-meta">
              <div>
                <span>Cliente</span>
                <span>#{pedido.cliente_id}</span>
              </div>
              <div>
                <span>Fecha</span>
                <span>{new Date(pedido.pedido_fecha).toLocaleDateString()}</span>
              </div>
              <div>
                <span>Total</span>
                <span>{formatearMonto(pedido.pedido_total)}</span>
              </div>
              <div>
                <span>Estado</span>
                <span className={`pedidos-badge estado-${pedido.pedido_estado}`}>
                  {ETIQUETA_ESTADO[pedido.pedido_estado]}
                </span>
              </div>
              {pedido.pedido_notas && (
                <div className="pedido-detalle-notas">
                  <span>Notas</span>
                  <span>{pedido.pedido_notas}</span>
                </div>
              )}
            </section>

            <div className="pedidos-tabla-wrap">
              <table className="pedido-lineas-tabla">
                <thead>
                  <tr>
                    <th scope="col">Producto</th>
                    <th scope="col" className="right">
                      Cant.
                    </th>
                    <th scope="col" className="right">
                      Precio
                    </th>
                    <th scope="col" className="right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.detalles.map((d) => (
                    <tr key={d.detalle_pedido_id}>
                      <td data-label="Producto">
                        {d.producto_nombre ?? `Producto #${d.producto_id}`}
                      </td>
                      <td className="right" data-label="Cant.">
                        {d.detalle_pedido_cantidad}
                      </td>
                      <td className="right" data-label="Precio">
                        {formatearMonto(d.detalle_pedido_precio_unitario)}
                      </td>
                      <td className="right" data-label="Total">
                        {formatearMonto(d.detalle_pedido_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {errorAccion && (
              <p className="pedidos-banner-error" role="alert">
                {errorAccion}
              </p>
            )}

            {transiciones.length > 0 && (
              <section
                className="pedido-acciones"
                aria-label="Cambiar estado del pedido"
              >
                <div className="pedido-acciones-nota">
                  <label htmlFor="admin-nota-estado">Nota (opcional)</label>
                  <input
                    id="admin-nota-estado"
                    type="text"
                    maxLength={255}
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Ej. Pago verificado"
                  />
                </div>
                <div className="pedido-acciones-botones">
                  {transiciones.map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      className={
                        estado === "CANCELADO"
                          ? "pedidos-btn-peligro"
                          : "pedidos-btn-primary"
                      }
                      onClick={() => ejecutarTransicion(estado)}
                      disabled={enviando}
                    >
                      {enviando ? "Procesando…" : ETIQUETA_ESTADO[estado]}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {pedido.historial && pedido.historial.length > 0 && (
              <section className="pedido-historial" aria-label="Historial de estados">
                <h2>Historial</h2>
                <ol className="pedido-historial-lista">
                  {pedido.historial.map((h) => (
                    <li key={h.historial_id}>
                      <span className="pedido-historial-fecha">
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                      <span className="pedido-historial-cambio">
                        {h.estado_anterior
                          ? `${ETIQUETA_ESTADO[h.estado_anterior]} → ${ETIQUETA_ESTADO[h.estado_nuevo]}`
                          : ETIQUETA_ESTADO[h.estado_nuevo]}
                      </span>
                      {h.historial_nota && (
                        <span className="pedido-historial-nota">
                          {h.historial_nota}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
