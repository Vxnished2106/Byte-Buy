import { useState } from "react";
import { Link } from "react-router";
import Header from "../components/Header";
import "../styles/payment.css";

type MetodoPagoId = "tarjeta" | "paypal" | "gift-card";

const metodosPago: {
  id: MetodoPagoId;
  titulo: string;
  subtitulo: string;
}[] = [
  {
    id: "tarjeta",
    titulo: "Tarjeta de crédito / débito",
    subtitulo: "Visa, Mastercard, Amex",
  },
  {
    id: "paypal",
    titulo: "PayPal",
    subtitulo: "Serás redirigido a PayPal",
  },
  {
    id: "gift-card",
    titulo: "Tarjeta de regalo",
    subtitulo: "Canjea tu código Byte&Buy",
  },
];

export default function Pago() {
  const [metodoPago, setMetodoPago] = useState<MetodoPagoId>("tarjeta");

  const items = [
    {
      id: 1,
      nombre: "Auriculares Aura Pro",
      cantidad: 1,
      precio: 249,
      imagen: "",
    },
  ];

  const subtotal = items.reduce(
    (acumulador, item) => acumulador + item.precio * item.cantidad,
    0,
  );
  const envio = 15;
  const total = subtotal + envio;

  return (
    <>
      <Header />
      <main className="payment-container">
        <section className="payment-method-section">
          <h2>Método de pago</h2>

          <div className="payment-options">
            {metodosPago.map((metodo) => (
              <label
                key={metodo.id}
                className={`payment-option ${
                  metodoPago === metodo.id ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  value={metodo.id}
                  checked={metodoPago === metodo.id}
                  onChange={() => setMetodoPago(metodo.id)}
                />
                <div className="payment-option-info">
                  <span className="payment-option-title">
                    {metodo.titulo}
                  </span>
                  <span className="payment-option-subtitle">
                    {metodo.subtitulo}
                  </span>
                </div>
                {metodo.id === "tarjeta" && metodoPago === "tarjeta" && (
                  <span className="payment-option-hint">•••• 4242</span>
                )}
              </label>
            ))}
          </div>

          {metodoPago === "tarjeta" && (
            <div className="card-form">
              <div className="form-group">
                <label htmlFor="numero-tarjeta">Número de tarjeta</label>
                <input
                  id="numero-tarjeta"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="titular">Titular</label>
                <input
                  id="titular"
                  type="text"
                  placeholder="Nombre en la tarjeta"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vencimiento">Vencimiento</label>
                  <input id="vencimiento" type="text" placeholder="MM / AA" />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input id="cvv" type="text" placeholder="123" />
                </div>
              </div>
            </div>
          )}

          {metodoPago === "paypal" && (
            <div className="card-form">
              <div className="form-group">
                <label htmlFor="correo-paypal">Correo de PayPal</label>
                <input
                  id="correo-paypal"
                  type="email"
                  placeholder="tu@paypal.com"
                />
              </div>

              <p className="payment-info-box">
                Al continuar, se abrirá una ventana segura de PayPal para
                autorizar el pago.
              </p>
            </div>
          )}

          {metodoPago === "gift-card" && (
            <div className="card-form">
              <div className="form-group">
                <label htmlFor="codigo-gift-card">
                  Código de tarjeta de regalo
                </label>
                <input
                  id="codigo-gift-card"
                  type="text"
                  placeholder="XXXX - XXXX - XXXX - XXXX"
                />
              </div>

              <p className="payment-info-box">
                Introduce el código de 16 dígitos que aparece al reverso de tu
                tarjeta.
              </p>
            </div>
          )}
        </section>

        <section className="order-summary">
          <h4>Tu pedido</h4>

          <div className="order-items">
            {items.map((item) => (
              <div className="order-item" key={item.id}>
                <div className="order-item-image">
                  {item.imagen && <img src={item.imagen} alt={item.nombre} />}
                  <span className="order-item-qty">{item.cantidad}</span>
                </div>
                <span className="order-item-name">{item.nombre}</span>
                <span className="order-item-price">${item.precio}</span>
              </div>
            ))}
          </div>

          <span className="separator"></span>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div className="summary-row">
            <span>Envío</span>
            <span>${envio}</span>
          </div>

          <span className="separator"></span>

          <div className="summary-total">
            <span>Total</span>
            <span>${total}</span>
          </div>

          <button type="button" className="continue-button">
            Continuar al pedido
          </button>

          <Link to="/byte&buy/carrito" className="back-link">
            ← Volver al carrito
          </Link>
        </section>
      </main>
    </>
  );
}
