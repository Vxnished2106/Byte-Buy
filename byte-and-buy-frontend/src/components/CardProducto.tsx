import React from "react";
import "../styles/cardProduct.css";
interface CardProducto {
  imagen: string;
  categoria: string;
  nombre_producto: string;
  precio: number;
}
export default function CardProducto({
  imagen,
  categoria,
  nombre_producto,
  precio,
}: CardProducto) {
  return (
    <article className="card">
      <div className="card-img">
        <img src={imagen} alt="imagen de producto" />
      </div>
      <div className="card-body">
        <div className="card-body-titles">
          <p className="card-body-categoria">{categoria}</p>
          <h4 className="card-body-title">{nombre_producto}</h4>
        </div>
        <h3 className="card-body-price">${precio}</h3>
        <button className="add-cart-button" type="submit">
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
