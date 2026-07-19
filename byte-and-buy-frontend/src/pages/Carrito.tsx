import { useEffect, useState } from "react";
import { Link } from "react-router";
import CarritoItem from "../components/CarritoItem";
import Header from "../components/Header";
import { useCarrito } from "../hooks/useCarrito";
import { obtenerCatalogo } from "../services/producto";
import { calcularCostoEnvio } from "../utils/carrito";
import "../styles/cart.css";

export default function Carrito() {
  const {
    carrito,
    loading,
    error,
    actualizandoProductoId,
    cambiarCantidad,
    eliminarProducto,
  } = useCarrito();

  // El carrito (`ResponseCarritoItemDto`) no trae imagen del producto, así
  // que se resuelve aparte con el catálogo público para poder mostrarla.
  const [imagenesPorProducto, setImagenesPorProducto] = useState<
    Record<number, string | null>
  >({});

  useEffect(() => {
    let vigente = true;
    obtenerCatalogo()
      .then((catalogo) => {
        if (!vigente) return;
        setImagenesPorProducto(
          Object.fromEntries(
            catalogo.map((p) => [p.producto_id, p.producto_imagen]),
          ),
        );
      })
      .catch(() => {
        // Sin imágenes el carrito sigue siendo usable (placeholder por nombre).
      });
    return () => {
      vigente = false;
    };
  }, []);

  const items = carrito?.items ?? [];
  const subtotal = carrito?.total ?? 0;
  const precioEnvio = calcularCostoEnvio(items);
  const total = subtotal + precioEnvio;

  return (
    <>
      <Header />
      <main className="car-conatiner">
        {loading ? (
          <p className="cart-status">Cargando carrito...</p>
        ) : error ? (
          <p className="cart-status cart-status-error">{error}</p>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <h3>Tu carrito está vacío</h3>
            <p>Descubre lo último en tecnología.</p>
            <Link to="/byte&buy/products" className="cart-empty-button">
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <>
            <h2>Tu carrito</h2>
            <section className="cart-items-section">
              {items.map((item) => (
                <CarritoItem
                  key={item.producto_id}
                  producto_id={item.producto_id}
                  producto_nombre={item.producto_nombre}
                  producto_imagen={imagenesPorProducto[item.producto_id]}
                  precio_unitario={item.precio_unitario}
                  descuento={item.descuento}
                  precio_final_unitario={item.precio_final_unitario}
                  cantidad={item.cantidad}
                  subtotal={item.subtotal}
                  actualizando={actualizandoProductoId === item.producto_id}
                  onCambiarCantidad={(cantidad) =>
                    cambiarCantidad(item.producto_id, cantidad)
                  }
                  onEliminar={() => eliminarProducto(item.producto_id)}
                />
              ))}
            </section>
            <section className="summary">
              <div className="summary-header">
                <h4>Resumen</h4>
                <div className="count">
                  <div className="subtotal">
                    <span className="count-title">Subtotal</span>
                    <span className="count-value">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="delivery">
                    <span className="count-title">Envio</span>
                    <span className="count-value">
                      {precioEnvio === 0 ? "Gratis" : `$${precioEnvio.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <span className="separator"></span>
                <div className="total">
                  <h5 className="total-title">Total</h5>
                  <span className="total-value">${total.toFixed(2)}</span>
                </div>
                <Link to={"/byte&buy/pago"} className="pay-button">
                  Proceder al pago
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
