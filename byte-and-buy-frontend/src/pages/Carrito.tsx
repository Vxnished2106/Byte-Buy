import React, { useState } from "react";
import CarritoItem from "../components/CarritoItem";
import Header from "../components/Header";
import { Link } from "react-router";
import "../styles/cart.css";

export default function Carrito() {
  const products = [
    {
      id: 1,
      nombre_producto: "SmartPhone",
      categoria: "Telefono",
      imagen: "https://www.intelec.co.cr/wp-content/uploads/2026/02/S948-N.jpg",
      precio: 2500,
    },

    {
      id: 2,
      nombre_producto: "Playstation 5",
      categoria: "Consolas",
      imagen:
        "https://extremetechcr.com/wp-content/uploads/2025/11/HYPERX-98.jpg",
      precio: 500,
    },
    {
      id: 3,
      nombre_producto: "SmartWatch",
      categoria: "Reloj",
      imagen:
        "https://walmartcr.vtexassets.com/arquivos/ids/765547/85877_01.jpg?v=638661822772000000",
      precio: 250,
    },
  ];
  const subtotal = products.reduce(
    (acumulador, producto) => acumulador + producto.precio,
    0,
  );
  const envioGratis = products.length >= 3;
  const precioEnvio = envioGratis ? 0 : 15;
  const total = subtotal + precioEnvio;
  return (
    <>
      <Header />
      <main className="car-conatiner">
        {products.length === 0 ? (
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
              {products.map((producto) => (
                <CarritoItem
                  key={producto.id}
                  nombre_producto={producto.nombre_producto}
                  categoria={producto.categoria}
                  imagen={producto.imagen}
                  precio={producto.precio}
                />
              ))}
            </section>
            <section className="summary">
              <div className="summary-header">
                <h4>Resumen</h4>
                <div className="count">
                  <div className="subtotal">
                    <span className="count-title">Subtotal</span>
                    <span className="count-value">${subtotal}</span>
                  </div>
                  <div className="delivery">
                    <span className="count-title">Envio</span>
                    <span className="count-value">
                      {precioEnvio === 0 ? "Gratis" : precioEnvio}
                    </span>
                  </div>
                </div>
                <span
                  className="
                separator"
                ></span>
                <div className="total">
                  <h5 className="total-title">Total</h5>
                  <span className="total-value">{total}</span>
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
