import { Link, useParams } from "react-router";
import Header from "../components/Header";
import { useDetalleCompra } from "../hooks/useDetalleCompra";
import { useFactura } from "../hooks/useFactura";
import { useUsuario } from "../hooks/useUsuario";
import { obtenerNombreCompleto } from "../utils/usuario";
import "../styles/facturacion.css";

/**
 * Previsualización de la factura de un pedido recién completado. Reproduce
 * en HTML la misma estructura que arma el backend al generar el PDF
 * (`pdf-factura.service.ts`: encabezado, datos de la factura, cliente,
 * tabla de productos y total), para que lo que el usuario ve en pantalla
 * coincida con lo que recibe por correo.
 *
 * `useFactura` dispara automáticamente el envío del PDF al correo del
 * cliente si la factura todavía no fue enviada (`factura_enviada === false`).
 * El botón para volver al catálogo solo aparece una vez que el envío se
 * confirma, para que el usuario sepa que su comprobante ya está en camino.
 */
export default function Facturacion() {
  const { facturaId } = useParams<{ facturaId: string }>();
  const facturaIdNum = facturaId ? Number(facturaId) : undefined;

  const { factura, loading, enviando, error } = useFactura(facturaIdNum);
  const { detalles, loading: detallesCargando } = useDetalleCompra(
    factura?.venta_id,
  );
  const { usuario } = useUsuario();

  if (loading) {
    return (
      <>
        <Header />
        <main className="invoice-container">
          <p className="invoice-loading">Cargando factura...</p>
        </main>
      </>
    );
  }

  if (error || !factura) {
    return (
      <>
        <Header />
        <main className="invoice-container">
          <p className="invoice-error">
            {error ?? "No se encontró la factura solicitada."}
          </p>
          <Link to="/byte&buy/products" className="continue-button-link">
            Volver al catálogo
          </Link>
        </main>
      </>
    );
  }

  const nombreCompleto = usuario
    ? obtenerNombreCompleto(
        usuario.usuario_nombre,
        usuario.usuario_apellido1,
        usuario.usuario_apellido2,
      )
    : "";

  return (
    <>
      <Header />
      <main className="invoice-container">
        <article className="invoice-paper">
          <div className="invoice-header">
            <h1 className="invoice-brand">
              <span className="B">B</span>yte<span>&</span>
              <span className="B">B</span>uy
            </h1>
            <p className="invoice-subtitle">Factura de Compra</p>
          </div>

          <section className="invoice-meta">
            <div className="invoice-meta-row">
              <span>Número de factura</span>
              <span>{factura.factura_numero}</span>
            </div>
            <div className="invoice-meta-row">
              <span>Fecha</span>
              <span>
                {new Date(factura.factura_fecha_creada).toLocaleDateString()}
              </span>
            </div>
            <div className="invoice-meta-row">
              <span>Estado</span>
              <span>{factura.factura_estado}</span>
            </div>
          </section>

          <section className="invoice-cliente">
            <h3>Cliente</h3>
            <p>{nombreCompleto}</p>
            <p>{usuario?.usuario_correo}</p>
          </section>

          <table className="invoice-table">
            <thead>
              <tr>
                <th className="left">Producto</th>
                <th className="center">Cant.</th>
                <th className="right">Precio</th>
                <th className="right">Subtotal</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {detallesCargando ? (
                <tr>
                  <td colSpan={5} className="invoice-table-status">
                    Cargando productos...
                  </td>
                </tr>
              ) : (
                detalles.map((detalle) => (
                  <tr key={detalle.detalle_compra_id}>
                    <td className="left">
                      {detalle.producto?.producto_nombre ??
                        `Producto #${detalle.producto_id}`}
                    </td>
                    <td className="center">
                      {detalle.detalle_compra_cantidad}
                    </td>
                    <td className="right">
                      ${detalle.detalle_compra_precio_unitario}
                    </td>
                    <td className="right">
                      ${detalle.detalle_compra_subtotal}
                    </td>
                    <td className="right">
                      ${detalle.detalle_compra_total}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="invoice-total">
            <span>Total factura</span>
            <span>${factura.factura_monto_total}</span>
          </div>

          <p className="invoice-thanks">Gracias por comprar en Byte & Buy.</p>

          {!factura.factura_enviada && (
            <p className="invoice-status">
              {enviando
                ? "Enviando tu factura por correo..."
                : "Tu factura se está preparando para el envío."}
            </p>
          )}

          {factura.factura_enviada && (
            <div className="invoice-actions">
              <p className="invoice-status success">
                Te enviamos la factura a tu correo.
              </p>
              <Link to="/byte&buy/products" className="continue-button-link">
                Volver al catálogo
              </Link>
            </div>
          )}
        </article>
      </main>
    </>
  );
}
