import { useMemo } from "react";
import "./App.css";
import Header from "./components/Header";
import CategoryCard from "./components/CategoryCard";
import { Link, useNavigate } from "react-router";
import { useCatalogoProductos } from "./hooks/useCatalogoProductos";
import { useCategoriasCatalogo } from "./hooks/useCategoriasCatalogo";
import { useCarrito } from "./hooks/useCarrito";
import type { Producto } from "./ts/interfaces";

function App() {
  const { productos, loading: loadingProductos } = useCatalogoProductos();
  const { categorias, totalProductos } = useCategoriasCatalogo();
  const { agregarProducto, actualizandoProductoId } = useCarrito();

  const productosDestacados = useMemo(() => {
    return productos.slice(0, 8);
  }, [productos]);

  const categoriasParaMostrar = useMemo(() => {
    if (categorias.length > 0) {
      return categorias.slice(0, 6);
    }
    return [
      { categoria_nombre: "Electrónica", conteo: 120, color: "#4b57d6" },
      { categoria_nombre: "Moda", conteo: 85, color: "#7c3aed" },
      { categoria_nombre: "Hogar", conteo: 67, color: "#0891b2" },
      { categoria_nombre: "Deportes", conteo: 43, color: "#059669" },
      { categoria_nombre: "Belleza", conteo: 52, color: "#db2777" },
      { categoria_nombre: "Libros", conteo: 38, color: "#d97706" },
    ] as typeof categorias;
  }, [categorias]);

  const handleAgregarAlCarrito = async (e: React.MouseEvent, producto: Producto) => {
    e.preventDefault();
    try {
      await agregarProducto(producto.producto_id, 1);
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
    }
  };

  return (
    <>
      <Header />
      <main className="home-main">
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-blur hero-blur-1" />
            <div className="hero-blur hero-blur-2" />
          </div>
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Nuevos productos cada semana
              </div>
              <h1 className="hero-title">
                Descubre la{" "}
                <span className="hero-title-highlight">tecnología</span>
                <br />
                que transforma tu día a día
              </h1>
              <p className="hero-subtitle">
                En Byte&Buy encontrarás los mejores productos de tecnología,
                hogar y estilo de vida con envío rápido y garantía de calidad.
                Explora más de {totalProductos || 500} productos seleccionados.
              </p>
              <div className="hero-actions">
                <Link to="/byte&buy/products" className="btn btn-primary btn-large">
                  Explorar catálogo
                </Link>
                <Link to="/byte&buy/products?destacados=true" className="btn btn-ghost btn-large">
                  Ver ofertas
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-number">{totalProductos || "500+"}</span>
                  <span className="hero-stat-label">Productos</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-number">24/7</span>
                  <span className="hero-stat-label">Soporte</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-number">48h</span>
                  <span className="hero-stat-label">Envío</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&amp;h=800&amp;fit=crop"
                  alt="Productos tecnológicos destacados"
                  className="hero-image"
                />
                <div className="hero-floating-card hero-floating-card-1">
                  <div className="hero-floating-icon">✓</div>
                  <div>
                    <div className="hero-floating-title">Garantía total</div>
                    <div className="hero-floating-subtitle">2 años en productos</div>
                  </div>
                </div>
                <div className="hero-floating-card hero-floating-card-2">
                  <div className="hero-floating-icon-truck" />
                  <div>
                    <div className="hero-floating-title">Envío gratis</div>
                    <div className="hero-floating-subtitle">En compras mayores a $99</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-shipping" />
              <div>
                <h3 className="feature-title">Envío rápido</h3>
                <p className="feature-desc">Entrega en 24-48h en pedidos confirmados</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-shield" />
              <div>
                <h3 className="feature-title">Pago seguro</h3>
                <p className="feature-desc">Múltiples métodos con encriptación SSL</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-headset" />
              <div>
                <h3 className="feature-title">Atención 24/7</h3>
                <p className="feature-desc">Equipo de soporte siempre disponible</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-return" />
              <div>
                <h3 className="feature-title">Devolución fácil</h3>
                <p className="feature-desc">30 días para devolver sin preguntas</p>
              </div>
            </div>
          </div>
        </section>

        <section className="categories-section">
          <div className="section-container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Explora por categoría</h2>
                <p className="section-subtitle">Navega por nuestras colecciones destacadas</p>
              </div>
              <Link to="/byte&buy/products" className="section-link">
                Ver todas las categorías →
              </Link>
            </div>
            <div className="categories-grid">
              {categoriasParaMostrar.map((cat, idx) => {
                const colores = ["#4b57d6", "#7c3aed", "#0891b2", "#059669", "#db2777", "#d97706"];
                const color = (cat as { color?: string }).color || colores[idx % colores.length];
                return (
                  <CategoryCard
                    key={idx}
                    nombre={cat.categoria_nombre}
                    conteo={(cat as { conteo?: number }).conteo || 0}
                    color={color}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="section-container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Productos destacados</h2>
                <p className="section-subtitle">Los favoritos de nuestros clientes esta semana</p>
              </div>
              <Link to="/byte&buy/products" className="section-link">
                Ver todos los productos →
              </Link>
            </div>

            {loadingProductos ? (
              <div className="products-loading">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="product-card skeleton">
                    <div className="product-image-container skeleton-image" />
                    <div className="product-info">
                      <div className="skeleton-line skeleton-line-1" />
                      <div className="skeleton-line skeleton-line-2" />
                      <div className="skeleton-line skeleton-line-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="products-grid">
                {productosDestacados.map((producto) => {
                  const isUpdating = actualizandoProductoId === producto.producto_id;
                  const precioFinal =
                    producto.producto_descuento && producto.producto_descuento > 0
                      ? producto.producto_precio * (1 - producto.producto_descuento / 100)
                      : producto.producto_precio;

                  return (
                    <Link
                      key={producto.producto_id}
                      to={`/byte&buy/products/${producto.producto_id}`}
                      className="product-card"
                    >
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
                        {producto.producto_descuento && producto.producto_descuento > 0 && (
                          <span className="discount-badge">
                            -{producto.producto_descuento}%
                          </span>
                        )}
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
                          {producto.producto_descuento && producto.producto_descuento > 0 ? (
                            <>
                              <span className="product-price">${precioFinal.toFixed(2)}</span>
                              <span className="product-price-old">
                                ${producto.producto_precio.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="product-price">
                              ${producto.producto_precio.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          className={`add-to-cart-btn ${isUpdating ? "is-loading" : ""}`}
                          onClick={(e) => handleAgregarAlCarrito(e, producto)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Agregando..." : "Agregar al carrito"}
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="promo-section">
          <div className="section-container">
            <div className="promo-banner">
              <div className="promo-text">
                <div className="promo-label">Oferta por tiempo limitado</div>
                <h2 className="promo-title">
                  Hasta 30% de descuento en electrónica
                </h2>
                <p className="promo-subtitle">
                  Celulares, laptops, accesorios y más. Aprovecha antes de que se acabe.
                </p>
                <Link
                  to="/byte&buy/products?categoria=Electr%C3%B3nica"
                  className="btn btn-primary btn-large"
                >
                  Ver ofertas
                </Link>
              </div>
              <div className="promo-visual">
                <div className="promo-circle promo-circle-1" />
                <div className="promo-circle promo-circle-2" />
                <img
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&amp;h=600&amp;fit=crop"
                  alt="Oferta de electrónica"
                  className="promo-image"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="section-container">
            <div className="newsletter-card">
              <div className="newsletter-content">
                <h2 className="newsletter-title">Recibe nuestras promociones</h2>
                <p className="newsletter-subtitle">
                  Suscríbete para obtener ofertas exclusivas y novedades de productos
                  directamente en tu correo.
                </p>
              </div>
              <form
                className="newsletter-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements[0] as HTMLInputElement);
                  if (input.value) {
                    input.value = "";
                    alert("¡Gracias por suscribirte!");
                  }
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Ingresa tu correo electrónico"
                  className="newsletter-input"
                />
                <button type="submit" className="btn btn-primary newsletter-submit">
                  Suscribirse
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="footer-logo">Byte&amp;Buy</h3>
              <p className="footer-tagline">
                Tu tienda online de tecnología y estilo de vida. Productos de calidad con el mejor servicio.
              </p>
            </div>
            <div className="footer-links-cols">
              <div>
                <h4 className="footer-heading">Comprar</h4>
                <ul className="footer-links">
                  <li><Link to="/byte&buy/products" className="footer-link">Catálogo</Link></li>
                  <li><Link to="/byte&buy/products?ofertas=true" className="footer-link">Ofertas</Link></li>
                  <li><Link to="/byte&buy/products?nuevos=true" className="footer-link">Novedades</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-heading">Ayuda</h4>
                <ul className="footer-links">
                  <li><a className="footer-link" href="#">Envíos</a></li>
                  <li><a className="footer-link" href="#">Devoluciones</a></li>
                  <li><a className="footer-link" href="#">Preguntas frecuentes</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-heading">Empresa</h4>
                <ul className="footer-links">
                  <li><Link to="/byte&buy/nosotros" className="footer-link">Nosotros</Link></li>
                  <li><Link to="/byte&buy/contacto" className="footer-link">Contacto</Link></li>
                  <li><a className="footer-link" href="#">Términos y condiciones</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 Byte&amp;Buy. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
