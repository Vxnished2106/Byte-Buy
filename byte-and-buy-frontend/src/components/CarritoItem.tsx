import "../styles/cartItem.css";

interface CarritoItemProps {
  producto_id: number;
  producto_nombre: string;
  /** Imagen del producto (viene del catálogo, no del carrito; ver nota abajo). */
  producto_imagen?: string | null;
  /** Precio de lista, sin descuento ni impuesto. */
  precio_unitario: number;
  /** Porcentaje de descuento aplicado (0 si no hay). */
  descuento: number;
  /** Precio unitario ya con descuento e impuesto aplicados; es lo que se cobra. */
  precio_final_unitario: number;
  cantidad: number;
  subtotal: number;
  /** `true` mientras hay una mutación en curso para este item (deshabilita los controles). */
  actualizando?: boolean;
  onCambiarCantidad: (cantidad: number) => void;
  onEliminar: () => void;
}

/**
 * El backend (`ResponseCarritoItemDto`) no expone imagen ni categoría del
 * producto en el carrito, así que `producto_imagen` se resuelve aparte (desde
 * el catálogo) y se pasa como prop; si no hay imagen se usa un placeholder
 * con el nombre del producto.
 */
export default function CarritoItem({
  producto_nombre,
  producto_imagen,
  precio_unitario,
  descuento,
  precio_final_unitario,
  cantidad,
  subtotal,
  actualizando = false,
  onCambiarCantidad,
  onEliminar,
}: CarritoItemProps) {
  const decreaseQuantity = () => {
    if (cantidad > 1) onCambiarCantidad(cantidad - 1);
  };
  const increaseQuantity = () => {
    onCambiarCantidad(cantidad + 1);
  };

  return (
    <div className="cart-item-container">
      <div className="cart-item-info">
        <div className="cart-item-info-image">
          <img
            src={
              producto_imagen ||
              `https://placehold.co/110x110?text=${encodeURIComponent(
                producto_nombre,
              )}`
            }
            alt={producto_nombre}
            loading="lazy"
          />
        </div>
        <div className="cart-item-info-about">
          <h4>{producto_nombre}</h4>
          <span>
            {descuento > 0 && (
              <span className="cart-item-precio-original">
                ${precio_unitario.toFixed(2)}{" "}
              </span>
            )}
            ${precio_final_unitario.toFixed(2)} c/u
          </span>
        </div>
      </div>

      <div className="cart-item-quantity">
        <button
          className="decrease"
          onClick={decreaseQuantity}
          disabled={actualizando || cantidad <= 1}
        >
          -
        </button>
        <span>{cantidad}</span>

        <button
          className="increase"
          onClick={increaseQuantity}
          disabled={actualizando}
        >
          +
        </button>
      </div>
      <div className="price-canceled">
        {`$${subtotal.toFixed(2)}`}
        <button
          className="delete-item"
          onClick={onEliminar}
          disabled={actualizando}
          aria-label={`Quitar ${producto_nombre} del carrito`}
        >
          X
        </button>
      </div>
    </div>
  );
}
