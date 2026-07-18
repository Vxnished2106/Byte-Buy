import React, { useState } from "react";
import "../styles/cartItem.css";
interface CarritoItemProps {
  categoria: string;
  nombre_producto: string;
  precio: number;
  imagen: string;
}
export default function CarritoItem({
  categoria,
  nombre_producto,
  precio,
  imagen,
}: CarritoItemProps) {
  const [quantity, setQuantity] = useState(1);
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };
  const decreaseQuantity = () => {
    setQuantity((prev) => prev - 1);
  };
  return (
    <div className="cart-item-container">
      <div className="cart-item-info">
        <div className="cart-item-info-image">
          <img src={imagen} alt={nombre_producto} />
        </div>
        <div className="cart-item-info-about">
          <span>{categoria}</span>
          <h4>{nombre_producto}</h4>
          <span>{precio} c/u</span>
        </div>
      </div>

      <div className="cart-item-quantity">
        <button className="decrease" onClick={decreaseQuantity}>
          -
        </button>
        <span>{quantity}</span>

        <button className="increase" onClick={increaseQuantity}>
          +
        </button>
      </div>
      <div className="price-canceled">
        {`$${precio}`}
        <button className="delete-item">X</button>
      </div>
    </div>
  );
}
