import { Link } from "react-router";
import "../styles/cardProduct.css";

interface CardProductoProps {
  producto_id: number;
  imagen: string;
  categoria: string;
  nombre_producto: string;
  precio: number;
}

export default function CardProducto({
  producto_id,
  imagen,
  categoria,
  nombre_producto,
  precio,
}: CardProductoProps) {
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
        <button
          className="add-cart-button"
          type="button"
          onClick={(e) => e.preventDefault()}
        >
          Agregar al carrito
        </button>
      </div>
    </Link>
  );
}
