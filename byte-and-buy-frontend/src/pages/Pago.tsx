import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import valid from "card-validator";
import Header from "../components/Header";
import { useCarrito } from "../hooks/useCarrito";
import { useMetodosPago } from "../hooks/useMetodosPago";
import { usePago } from "../hooks/usePago";
import { confirmarPagoPedido } from "../services/pedido";
import type { EstadoConPedido, EstadoPostPago } from "../ts/pedidoReglas";
import { calcularCostoEnvio } from "../utils/carrito";
import Visa from "../assets/favicon/visa";
import Mastercard from "../assets/favicon/master_card";
import AmericanExpress from "../assets/favicon/american_express";
import Discover from "../assets/favicon/discover";
import "../styles/pago.css";

/**
 * El pago está simulado: no se valida si la tarjeta es real ni su marca, solo
 * el formato de lo que el usuario ingresa en cada formulario (según el
 * método elegido, detectado por su nombre). El formato de los campos de
 * tarjeta se valida con `card-validator`.
 */
function esMetodoTarjeta(nombre: string): boolean {
  return /tarjeta(?!.*regalo)/i.test(nombre);
}

function esMetodoPaypal(nombre: string): boolean {
  return /paypal/i.test(nombre);
}

function esMetodoGiftCard(nombre: string): boolean {
  return /gift[\s-]?card|tarjeta de regalo/i.test(nombre);
}

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Iconos de marca por el `type` que devuelve `card-validator` para el número ingresado. */
const ICONOS_TARJETA: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  visa: Visa,
  mastercard: Mastercard,
  "american-express": AmericanExpress,
  discover: Discover,
};

function validarNumeroTarjeta(numero: string): boolean {
  return valid.number(numero).isValid;
}

function validarVencimientoTarjeta(fecha: string): boolean {
  return valid.expirationDate(fecha).isValid;
}

function validarCvv(cvv: string, tamanoEsperado?: number): boolean {
  return valid.cvv(cvv, tamanoEsperado ?? [3, 4]).isValid;
}

/**
 * Agrega automáticamente el "/" entre mes y año apenas se completan los 2
 * dígitos del mes, y recorta el mes a un valor real (01-12) para que no se
 * pueda escribir un mes inexistente (ej. "18").
 */
function formatearVencimiento(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length <= 1) return digitos;

  let mes = digitos.slice(0, 2);
  if (Number(mes) === 0) mes = "01";
  else if (Number(mes) > 12) mes = "12";

  const anio = digitos.slice(2);
  return anio ? `${mes}/${anio}` : `${mes}/`;
}

/** Valida el formato del correo de PayPal (no hay verificación real de la cuenta). */
function validarCorreoPaypal(correo: string): boolean {
  return REGEX_CORREO.test(correo.trim());
}

/**
 * Valida el código de tarjeta de regalo: 16 caracteres alfanuméricos, sin
 * contar espacios o guiones separadores (ej. "XXXX-XXXX-XXXX-XXXX").
 */
function validarCodigoGiftCard(codigo: string): boolean {
  return /^[A-Za-z0-9]{16}$/.test(codigo.replace(/[\s-]/g, ""));
}

export default function Pago() {
  const navigate = useNavigate();
  const location = useLocation();
  // `PedidoForm` deja acá el pedido (con su dirección de envío) recién creado
  // desde el carrito. Si falta (ej. se llega directo a esta URL sin haber
  // pasado por ahí), se usa el flujo anterior como respaldo: pedir la
  // dirección de envío después de pagar.
  const estadoConPedido = location.state as EstadoConPedido | null;
  const {
    carrito,
    loading: carritoCargando,
    eliminarProducto,
  } = useCarrito();
  const { metodos, loading: metodosCargando, error: errorMetodos } =
    useMetodosPago();
  const { pagar, procesando, error: errorPago } = usePago();

  const items = carrito?.items ?? [];
  const subtotal = carrito?.total ?? 0;
  const envio = calcularCostoEnvio(items);
  const total = subtotal + envio;

  const [metodoPagoId, setMetodoPagoId] = useState<number | null>(null);
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [titular, setTitular] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [correoPaypal, setCorreoPaypal] = useState("");
  const [codigoGiftCard, setCodigoGiftCard] = useState("");
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  // Mientras el usuario no elija explícitamente, se usa el primer método
  // cargado como selección por defecto (derivado, sin useEffect).
  const metodoPagoIdEfectivo = metodoPagoId ?? metodos[0]?.metodo_pago_id ?? null;
  const metodoSeleccionado = metodos.find(
    (m) => m.metodo_pago_id === metodoPagoIdEfectivo,
  );
  const esTarjeta = metodoSeleccionado
    ? esMetodoTarjeta(metodoSeleccionado.metodo_pago_nombre)
    : false;
  const esPaypal = metodoSeleccionado
    ? esMetodoPaypal(metodoSeleccionado.metodo_pago_nombre)
    : false;
  const esGiftCard = metodoSeleccionado
    ? esMetodoGiftCard(metodoSeleccionado.metodo_pago_nombre)
    : false;

  // Marca de la tarjeta detectada en vivo a partir del número ingresado.
  const tarjetaDetectada = valid.number(numeroTarjeta).card;
  const IconoTarjeta = tarjetaDetectada
    ? ICONOS_TARJETA[tarjetaDetectada.type]
    : null;
  const tamanoCvvEsperado = tarjetaDetectada?.code.size;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrito || items.length === 0 || !metodoSeleccionado) return;
    setErrorFormulario(null);

    // El pago es simulado: solo se valida el formato de lo ingresado (no si
    // la tarjeta es real, ni su marca, ni si la cuenta de PayPal existe).
    let detalle: Record<string, unknown> | undefined;
    if (esTarjeta) {
      if (!titular.trim()) {
        setErrorFormulario("Ingresa el nombre del titular");
        return;
      }
      if (!validarNumeroTarjeta(numeroTarjeta)) {
        setErrorFormulario("Ingresa un número de tarjeta válido");
        return;
      }
      if (!validarVencimientoTarjeta(vencimiento)) {
        setErrorFormulario(
          valid.expirationDate(vencimiento).isPotentiallyValid
            ? "Completa la fecha de vencimiento (MM/AA)"
            : "La tarjeta está vencida o la fecha de vencimiento no es válida",
        );
        return;
      }
      if (!validarCvv(cvv, tamanoCvvEsperado)) {
        setErrorFormulario(`El CVV debe tener ${tamanoCvvEsperado ?? "3 o 4"} dígitos`);
        return;
      }
      detalle = {
        numero_tarjeta_ultimos4: numeroTarjeta.replace(/[\s-]/g, "").slice(-4),
      };
    } else if (esPaypal) {
      if (!validarCorreoPaypal(correoPaypal)) {
        setErrorFormulario("Ingresa un correo de PayPal válido");
        return;
      }
      detalle = { correo_paypal: correoPaypal.trim() };
    } else if (esGiftCard) {
      if (!validarCodigoGiftCard(codigoGiftCard)) {
        setErrorFormulario(
          "El código de la tarjeta de regalo debe tener 16 caracteres",
        );
        return;
      }
      detalle = {
        codigo_gift_card_ultimos4: codigoGiftCard
          .replace(/[\s-]/g, "")
          .slice(-4),
      };
    }

    try {
      const { factura } = await pagar({
        carrito_id: carrito.carrito_id,
        monto: total,
        metodo_pago_id: metodoSeleccionado.metodo_pago_id,
        detalle,
        items: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
      });

      // La venta ya quedó registrada: se vacía el carrito para reflejar la compra.
      await Promise.all(
        items.map((item) => eliminarProducto(item.producto_id)),
      );

      if (estadoConPedido) {
        // El pedido ya existía (creado antes de pagar) y se quedó en
        // BORRADOR: se alinea con la venta ya registrada (CONFIRMADO, sin
        // volver a descontar stock) para que, si se cancela después, se
        // repongan los productos. Es best-effort: si falla, no se bloquea
        // la confirmación de la compra, que ya se completó.
        try {
          await confirmarPagoPedido(estadoConPedido.pedidoId);
        } catch (err) {
          console.error("No se pudo confirmar el pedido tras el pago", err);
        }
        navigate(`/byte&buy/facturacion/${factura.factura_id}`);
      } else {
        // Respaldo: se llegó a pagar sin haber creado antes el pedido. Se
        // pide la dirección de envío/notas a través del formulario de
        // pedidos (prellenado con lo comprado); `PedidoForm` usa este estado
        // para saber que viene de acá y mandar a facturación al terminar.
        navigate("/byte&buy/pedidos/nuevo", {
          state: {
            facturaId: factura.factura_id,
            facturaNumero: factura.factura_numero,
            items: items.map((item) => ({
              producto_id: item.producto_id,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
              descuento_pct: item.descuento,
            })),
          } satisfies EstadoPostPago,
        });
      }
    } catch {
      // El mensaje de error ya queda expuesto en `errorPago`.
    }
  };

  if (carritoCargando || metodosCargando) {
    return (
      <>
        <Header />
        <main className="payment-container">
          <p className="payment-status">Cargando...</p>
        </main>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="payment-container">
          <div className="cart-empty">
            <h3>Tu carrito está vacío</h3>
            <p>Agrega productos antes de continuar al pago.</p>
            <Link to="/byte&buy/products" className="cart-empty-button">
              Explorar catálogo
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="payment-container">
        <form className="payment-method-section" onSubmit={handleSubmit}>
          <h2>Método de pago</h2>

          {errorMetodos && <p className="payment-error">{errorMetodos}</p>}

          {metodos.length === 0 ? (
            <p className="payment-info-box">
              No hay métodos de pago disponibles por el momento.
            </p>
          ) : (
            <>
              <div className="payment-options">
                {metodos.map((metodo) => (
                  <label
                    key={metodo.metodo_pago_id}
                    className={`payment-option ${
                      metodoPagoIdEfectivo === metodo.metodo_pago_id ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value={metodo.metodo_pago_id}
                      checked={metodoPagoIdEfectivo === metodo.metodo_pago_id}
                      onChange={() => setMetodoPagoId(metodo.metodo_pago_id)}
                    />
                    <div className="payment-option-info">
                      <span className="payment-option-title">
                        {metodo.metodo_pago_nombre}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {esTarjeta && (
                <div className="card-form">
                  <div className="form-group">
                    <label htmlFor="numero-tarjeta">Número de tarjeta</label>
                    <div className="card-number-input-wrapper">
                      <input
                        id="numero-tarjeta"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={numeroTarjeta}
                        onChange={(e) => setNumeroTarjeta(e.target.value)}
                        required
                      />
                      {IconoTarjeta && (
                        <IconoTarjeta
                          className="card-type-icon"
                          aria-label={tarjetaDetectada?.niceType}
                        />
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="titular">Titular</label>
                    <input
                      id="titular"
                      type="text"
                      placeholder="Nombre en la tarjeta"
                      value={titular}
                      onChange={(e) => setTitular(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="vencimiento">Vencimiento</label>
                      <input
                        id="vencimiento"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/AA"
                        value={vencimiento}
                        onChange={(e) =>
                          setVencimiento(formatearVencimiento(e.target.value))
                        }
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        id="cvv"
                        type="text"
                        inputMode="numeric"
                        placeholder={tamanoCvvEsperado === 4 ? "1234" : "123"}
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, ""))
                        }
                        maxLength={tamanoCvvEsperado ?? 4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {esPaypal && (
                <div className="card-form">
                  <div className="form-group">
                    <label htmlFor="correo-paypal">Correo de PayPal</label>
                    <input
                      id="correo-paypal"
                      type="email"
                      placeholder="tu@paypal.com"
                      value={correoPaypal}
                      onChange={(e) => setCorreoPaypal(e.target.value)}
                      required
                    />
                  </div>

                  <p className="payment-info-box">
                    Al continuar, se verificará el correo de tu cuenta de
                    PayPal para procesar el pago.
                  </p>
                </div>
              )}

              {esGiftCard && (
                <div className="card-form">
                  <div className="form-group">
                    <label htmlFor="codigo-gift-card">
                      Código de tarjeta de regalo
                    </label>
                    <input
                      id="codigo-gift-card"
                      type="text"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={codigoGiftCard}
                      onChange={(e) => setCodigoGiftCard(e.target.value)}
                      required
                    />
                  </div>

                  <p className="payment-info-box">
                    Introduce el código de 16 caracteres que aparece al
                    reverso de tu tarjeta.
                  </p>
                </div>
              )}

              {!esTarjeta && !esPaypal && !esGiftCard && metodoSeleccionado && (
                <p className="payment-info-box">
                  Tu pedido se procesará mediante{" "}
                  {metodoSeleccionado.metodo_pago_nombre}.
                </p>
              )}
            </>
          )}

          {errorFormulario && (
            <p className="payment-error">{errorFormulario}</p>
          )}
          {errorPago && <p className="payment-error">{errorPago}</p>}

          <button
            type="submit"
            className="continue-button"
            disabled={procesando || !metodoSeleccionado}
          >
            {procesando ? "Procesando..." : "Continuar al pedido"}
          </button>

          <Link to="/byte&buy/carrito" className="back-link">
            ← Volver al carrito
          </Link>
        </form>

        <section className="order-summary">
          <h4>Tu pedido</h4>

          <div className="order-items">
            {items.map((item) => (
              <div className="order-item" key={item.producto_id}>
                <div className="order-item-image">
                  <span className="order-item-qty">{item.cantidad}</span>
                </div>
                <span className="order-item-name">{item.producto_nombre}</span>
                <span className="order-item-price">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <span className="separator"></span>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Envío</span>
            <span>{envio === 0 ? "Gratis" : `$${envio.toFixed(2)}`}</span>
          </div>

          <span className="separator"></span>

          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </section>
      </main>
    </>
  );
}
