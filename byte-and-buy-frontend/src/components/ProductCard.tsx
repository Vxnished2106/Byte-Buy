import { Link } from "react-router";
import type { Producto } from "../ts/interfaces";

interface Props {
  producto: Producto;
  isUpdating: boolean;
  onAgregar: (e: React.MouseEvent, producto: Producto) => void;
  /** Etiqueta opcional para resaltar el producto (ej. "#1 más vendido"). */
  rankBadge?: string;
}

/** Tarjeta de producto reutilizada por las secciones de destacados, más vendidos y descuentos del home. */
export default function ProductCard({ producto, isUpdating, onAgregar, rankBadge }: Props) {
  const tieneDescuento = producto.producto_descuento > 0;
  const precioFinal = tieneDescuento
    ? producto.producto_precio * (1 - producto.producto_descuento / 100)
    : producto.producto_precio;

  return (
    <Link to={`/byte&buy/products/${producto.producto_id}`} className="product-card">
      <div className="product-image-container">
        {producto.producto_imagen ? (
          <img
            src={producto.producto_imagen}
            alt={producto.producto_nombre}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">Sin imagen</div>
        )}
        <div className="product-badges-top-left">
          {rankBadge && <span className="rank-badge">{rankBadge}</span>}
          {tieneDescuento && (
            <span className="discount-badge">-{producto.producto_descuento}%</span>
          )}
        </div>
        {producto.producto_estado === "activo" ? (
          <span className="stock-badge in-stock">Disponible</span>
        ) : (
          <span className="stock-badge out-stock">Agotado</span>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{producto.producto_nombre}</h3>
        <div className="product-category-list">
          {producto.categorias?.slice(0, 1).map((c) => (
            <span key={c.categoria_id} className="product-category-tag">
              {c.categoria_nombre}
            </span>
          ))}
        </div>
        <div className="product-price-row">
          {tieneDescuento ? (
            <>
              <span className="product-price">${precioFinal.toFixed(2)}</span>
              <span className="product-price-old">
                ${producto.producto_precio.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="product-price">${producto.producto_precio.toFixed(2)}</span>
          )}
        </div>
        <button
          className={`add-to-cart-btn ${isUpdating ? "is-loading" : ""}`}
          onClick={(e) => onAgregar(e, producto)}
          disabled={isUpdating}
        >
          {isUpdating ? "Agregando..." : "Agregar al carrito"}
        </button>
      </div>
    </Link>
  );
}
