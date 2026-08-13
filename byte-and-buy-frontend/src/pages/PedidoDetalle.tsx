import { Link, useNavigate, useParams } from "react-router";
import Header from "../components/Header";
import { usePedido } from "../hooks/usePedido";
import {
  ETIQUETA_ESTADO,
  formatearMonto,
  type EstadoConPedido,
} from "../ts/pedidoReglas";
import "../styles/pedidos.css";

/**
 * Vista de detalle de un pedido: cabecera y líneas.
 * El cambio de estado del pedido lo hace el admin desde el panel de
 * administración, no el cliente.
 */
export default function PedidoDetalle() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pedidoId = id ? Number(id) : undefined;

  const { pedido, loading, error } = usePedido(pedidoId);

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

        {pedido.pedido_estado === "BORRADOR" && (
          <div className="pedido-detalle-acciones">
            <p className="pedidos-banner-info">
              Este pedido quedó pendiente de pago. Puedes finalizarlo cuando
              quieras; se cobrarán estos productos sin tocar tu carrito.
            </p>
            <button
              type="button"
              className="pedidos-btn-primary"
              onClick={() =>
                navigate("/byte&buy/pago", {
                  state: {
                    pedidoId: pedido.pedido_id,
                    pedidoNumero: pedido.pedido_numero,
                    pedidoVersion: pedido.pedido_version,
                    desdeBorrador: true,
                  } satisfies EstadoConPedido,
                })
              }
            >
              Finalizar compra
            </button>
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
                  <td data-label="Producto">{d.producto_nombre ?? `Producto #${d.producto_id}`}</td>
                  <td className="right" data-label="Cant.">{d.detalle_pedido_cantidad}</td>
                  <td className="right" data-label="Precio">{formatearMonto(d.detalle_pedido_precio_unitario)}</td>
                  <td className="right" data-label="Desc.">{formatearMonto(d.detalle_pedido_descuento_monto)}</td>
                  <td className="right" data-label="Impuesto">{formatearMonto(d.detalle_pedido_impuesto_monto)}</td>
                  <td className="right" data-label="Total">{formatearMonto(d.detalle_pedido_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
