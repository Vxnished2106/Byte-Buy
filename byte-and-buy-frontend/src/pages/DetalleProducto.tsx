import { useMemo } from "react";
import { Link, useParams } from "react-router";
import Header from "../components/Header";
import { useDetalleProducto } from "../hooks/useDetalleProducto";
import "../styles/detalleProducto.css";

// Umbral de "quedan pocas unidades". El backend no expone el stock mínimo
// real de cada producto en el detalle público (ese dato vive en el
// inventario, solo accesible para admin), así que se usa un umbral fijo.
const STOCK_BAJO_UMBRAL = 5;

export default function DetalleProducto() {
  const { id } = useParams<{ id: string }>();
  const producto_id = id ? Number(id) : undefined;
  const { producto, loading, error } = useDetalleProducto(producto_id);

  const stockBajo = useMemo(() => {
    if (!producto || !producto.puedeComprar) return false;
    return producto.stock_actual <= STOCK_BAJO_UMBRAL;
  }, [producto]);

  const precioConDescuento = useMemo(() => {
    if (!producto || !producto.producto_descuento) return null;
    return producto.producto_precio * (1 - producto.producto_descuento / 100);
  }, [producto]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="detalle-producto-container">
          <p className="detalle-producto-status">Cargando producto...</p>
        </main>
      </>
    );
  }

  if (error || !producto) {
    return (
      <>
        <Header />
        <main className="detalle-producto-container">
          <p className="detalle-producto-status detalle-producto-status-error">
            {error ?? "Producto no encontrado"}
          </p>
          <Link to="/byte&buy/products" className="detalle-producto-volver">
            Volver al catalogo
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="detalle-producto-container">
        <Link to="/byte&buy/products" className="detalle-producto-volver">
          &larr; Volver al catalogo
        </Link>

        {producto.producto_banner && (
          <div className="detalle-producto-banner">
            <img src={producto.producto_banner} alt="" loading="lazy" />
          </div>
        )}

        <div className="detalle-producto-content">
          <div className="detalle-producto-imagen">
            <img
              src={
                producto.producto_imagen ||
                `https://placehold.co/500x500?text=${producto.producto_nombre}`
              }
              alt={producto.producto_nombre}
              loading="lazy"
            />
          </div>

          <div className="detalle-producto-info">
            {producto.categorias.length > 0 && (
              <div className="detalle-producto-chips">
                {producto.categorias.map((categoria) => (
                  <span
                    key={categoria.categoria_id}
                    className="detalle-producto-chip"
                  >
                    {categoria.categoria_nombre}
                  </span>
                ))}
              </div>
            )}

            <h1 className="detalle-producto-nombre">
              {producto.producto_nombre}
            </h1>

            <div className="detalle-producto-precio">
              {precioConDescuento !== null ? (
                <>
                  <span className="detalle-producto-precio-original">
                    ${producto.producto_precio.toFixed(2)}
                  </span>
                  <span className="detalle-producto-precio-final">
                    ${precioConDescuento.toFixed(2)}
                  </span>
                  <span className="detalle-producto-descuento-badge">
                    -{producto.producto_descuento}%
                  </span>
                </>
              ) : (
                <span className="detalle-producto-precio-final">
                  ${producto.producto_precio.toFixed(2)}
                </span>
              )}
            </div>

            {producto.producto_impuesto > 0 && (
              <p className="detalle-producto-impuesto">
                Incluye {producto.producto_impuesto}% de impuesto
              </p>
            )}

            <p
              className={
                producto.puedeComprar
                  ? "detalle-producto-disponibilidad"
                  : "detalle-producto-disponibilidad detalle-producto-agotado"
              }
            >
              {producto.puedeComprar
                ? `En stock (${producto.stock_actual} disponibles)`
                : "Agotado"}
            </p>

            {stockBajo && (
              <p className="detalle-producto-stock-bajo">
                ¡Quedan pocas unidades! Solo {producto.stock_actual} en stock.
              </p>
            )}

            {producto.producto_descripcion && (
              <p className="detalle-producto-descripcion">
                {producto.producto_descripcion}
              </p>
            )}

            {producto.etiquetas.length > 0 && (
              <div className="detalle-producto-chips detalle-producto-etiquetas">
                {producto.etiquetas.map((etiqueta) => (
                  <span
                    key={etiqueta.etiqueta_id}
                    className="detalle-producto-chip detalle-producto-chip-etiqueta"
                  >
                    {etiqueta.etiqueta_nombre}
                  </span>
                ))}
              </div>
            )}

            <button
              className="detalle-producto-add-cart"
              type="button"
              disabled={!producto.puedeComprar}
            >
              {producto.puedeComprar ? "Agregar al carrito" : "Agotado"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
