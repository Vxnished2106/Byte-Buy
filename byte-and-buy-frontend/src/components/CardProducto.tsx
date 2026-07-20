import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCarrito } from "../hooks/useCarrito";
import { useSesion } from "../hooks/useSesion";
import "../styles/cardProduct.css";

/**
 * Props para el componente CardProducto.
 */
interface CardProductoProps {
  /** ID del producto. */
  producto_id: number;
  /** URL de la imagen del producto. */
  imagen: string;
  /** Nombre de la categoría del producto. */
  categoria: string;
  /** Nombre del producto. */
  nombre_producto: string;
  /** Precio del producto. */
  precio: number;
}

/**
 * Componente de tarjeta de producto para el catálogo.
 * Muestra la imagen, categoría, nombre, precio y botón para agregar al carrito.
 */
export default function CardProducto({
  producto_id,
  imagen,
  categoria,
  nombre_producto,
  precio,
}: CardProductoProps) {
  const navigate = useNavigate();
  const { session } = useSesion();
  const { agregarProducto, actualizandoProductoId } = useCarrito();
  const [error, setError] = useState<string | null>(null);
  const agregando = actualizandoProductoId === producto_id;

  const handleAgregar = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      navigate("/byte&buy/login");
      return;
    }
    setError(null);
    try {
      await agregarProducto(producto_id, 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar");
    }
  };

  return (
    <Link to={`/byte&buy/products/${producto_id}`} className="card">
      <div className="card-img">
        <img
          src={imagen || `https://placehold.co/300x300?text=${categoria}`}
          alt="imagen de producto"
          loading="lazy"
        />
      </div>
      <div className="card-body">
        <div className="card-body-titles">
          <p className="card-body-categoria">{categoria}</p>
          <h4 className="card-body-title">{nombre_producto}</h4>
        </div>
        <h3 className="card-body-price">${precio}</h3>
        {error && <p className="add-cart-error">{error}</p>}
        <button
          className="add-cart-button"
          type="button"
          disabled={agregando}
          onClick={handleAgregar}
        >
          {agregando ? "Agregando..." : "Agregar al carrito"}
        </button>
      </div>
    </Link>
  );
}
