import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Header from "../components/Header";
import { usePedido } from "../hooks/usePedido";
import { cambiarEstadoPedido } from "../services/pedido";
import {
  ETIQUETA_ESTADO,
  formatearMonto,
  transicionesDesde,
} from "../ts/pedidoReglas";
import type { PedidoEstado } from "../ts/interfaces";
import "../styles/pedidos.css";

/** Vista de detalle de un pedido: cabecera, líneas, historial y transiciones. */
export default function PedidoDetalle() {
  const { id } = useParams<{ id: string }>();
  const pedidoId = id ? Number(id) : undefined;
  const navigate = useNavigate();

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
      await recargar(); // Trae la nueva versión para la siguiente acción.
    } catch (err) {
      setErrorAccion(err instanceof Error ? err.message : "No se pudo cambiar el estado");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="pedidos-container">
          <p className="pedidos-cargando">Cargando pedido…</p>
        </main>
      </>
    );
  }

  if (error || !pedido) {
    return (
      <>
        <Header />
        <main className="pedidos-container">
          <p className="pedidos-banner-error" role="alert">
            {error ?? "No se encontró el pedido."}
          </p>
          <Link className="pedidos-link" to="/byte&buy/pedidos">
            ← Volver al listado
          </Link>
        </main>
      </>
    );
  }

  const transiciones = transicionesDesde(pedido.pedido_estado);
  const esConflicto = errorAccion && /reciente|modificad|versión|version/i.test(errorAccion);

  return (
    <>
      <Header />
      <main className="pedidos-container">
        <div className="pedidos-topbar">
          <div>
            <Link className="pedidos-link" to="/byte&buy/pedidos">
              ← Pedidos
            </Link>
            <h1>{pedido.pedido_numero}</h1>
          </div>
          <span className={`pedidos-badge estado-${pedido.pedido_estado}`}>
            {ETIQUETA_ESTADO[pedido.pedido_estado]}
          </span>
        </div>

        {errorAccion && (
          <div className="pedidos-banner-error" role="alert">
            {errorAccion}
            {esConflicto && (
              <button type="button" className="pedidos-link-btn" onClick={() => recargar()}>
                Recargar
              </button>
            )}
          </div>
        )}

        <section className="pedido-detalle-meta">
          <div><span>Fecha</span><span>{new Date(pedido.pedido_fecha).toLocaleDateString()}</span></div>
          <div><span>Total</span><span>{formatearMonto(pedido.pedido_total)}</span></div>
          <div><span>Versión</span><span>#{pedido.pedido_version}</span></div>
          {pedido.pedido_notas && (
            <div className="pedido-detalle-notas"><span>Notas</span><span>{pedido.pedido_notas}</span></div>
          )}
        </section>

        {/* Líneas */}
        <div className="pedidos-tabla-wrap">
          <table className="pedido-lineas-tabla">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col" className="right">Cant.</th>
                <th scope="col" className="right">Precio</th>
                <th scope="col" className="right">Desc.</th>
                <th scope="col" className="right">Impuesto</th>
                <th scope="col" className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedido.detalles.map((d) => (
                <tr key={d.detalle_pedido_id}>
                  <td>{d.producto_nombre ?? `Producto #${d.producto_id}`}</td>
                  <td className="right">{d.detalle_pedido_cantidad}</td>
                  <td className="right">{formatearMonto(d.detalle_pedido_precio_unitario)}</td>
                  <td className="right">{formatearMonto(d.detalle_pedido_descuento_monto)}</td>
                  <td className="right">{formatearMonto(d.detalle_pedido_impuesto_monto)}</td>
                  <td className="right">{formatearMonto(d.detalle_pedido_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Acciones de estado */}
        {(transiciones.length > 0 || pedido.pedido_estado === "BORRADOR") && (
          <section className="pedido-acciones" aria-label="Acciones del pedido">
            {transiciones.length > 0 && (
              <div className="pedido-acciones-nota">
                <label htmlFor="nota-estado">Nota (opcional)</label>
                <input
                  id="nota-estado"
                  type="text"
                  maxLength={255}
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Ej. Pago verificado"
                />
              </div>
            )}
            <div className="pedido-acciones-botones">
              {pedido.pedido_estado === "BORRADOR" && (
                <button
                  type="button"
                  className="pedidos-btn-secundario"
                  onClick={() => navigate(`/byte&buy/pedidos/${pedido.pedido_id}/editar`)}
                >
                  Editar
                </button>
              )}
              {transiciones.map((estado) => (
                <button
                  key={estado}
                  type="button"
                  className={estado === "CANCELADO" ? "pedidos-btn-peligro" : "pedidos-btn-primary"}
                  onClick={() => ejecutarTransicion(estado)}
                  disabled={enviando}
                >
                  {enviando ? "Procesando…" : ETIQUETA_ESTADO[estado]}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Historial */}
        <section className="pedido-historial" aria-label="Historial de estados">
          <h2>Historial</h2>
          <ol className="pedido-historial-lista">
            {(pedido.historial ?? []).map((h) => (
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
                  <span className="pedido-historial-nota">{h.historial_nota}</span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
