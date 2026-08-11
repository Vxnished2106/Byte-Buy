import { useMemo } from "react";
import "./App.css";
import Header from "./components/Header";
import CategoryCard from "./components/CategoryCard";
import ProductCard from "./components/ProductCard";
import { Link } from "react-router";
import { useCatalogoProductos } from "./hooks/useCatalogoProductos";
import { useCategoriasCatalogo } from "./hooks/useCategoriasCatalogo";
import { useProductosMasVendidos } from "./hooks/useProductosMasVendidos";
import { useCarrito } from "./hooks/useCarrito";
import type { Producto } from "./ts/interfaces";

interface CategoriaParaMostrar {
  nombre: string;
  cantidad: number;
  color: string;
}

function App() {
  const { productos, loading: loadingProductos } = useCatalogoProductos();
  const { categorias, total: totalProductos } = useCategoriasCatalogo();
  const { productos: productosMasVendidos, loading: loadingMasVendidos } =
    useProductosMasVendidos(4);
  const { agregarProducto, actualizandoProductoId } = useCarrito();

  const productoMasVendido = productosMasVendidos[0];

  const productosDestacados = useMemo(() => {
    return productos.slice(0, 8);
  }, [productos]);

  const productosConDescuento = useMemo(() => {
    return productos.filter((p) => p.producto_descuento > 0).slice(0, 8);
  }, [productos]);

  const coloresCategorias = [
    "#4b57d6",
    "#7c3aed",
    "#0891b2",
    "#059669",
    "#db2777",
    "#d97706",
  ];

  const categoriasParaMostrar = useMemo<CategoriaParaMostrar[]>(() => {
    if (categorias.length > 0) {
      return categorias.slice(0, 6).map((cat, idx) => ({
        nombre: cat.nombre,
        cantidad: cat.cantidad,
        color: coloresCategorias[idx % coloresCategorias.length],
      }));
    }
    return [
      { nombre: "Electrónica", cantidad: 120, color: "#4b57d6" },
      { nombre: "Moda", cantidad: 85, color: "#7c3aed" },
      { nombre: "Hogar", cantidad: 67, color: "#0891b2" },
      { nombre: "Deportes", cantidad: 43, color: "#059669" },
      { nombre: "Belleza", cantidad: 52, color: "#db2777" },
      { nombre: "Libros", cantidad: 38, color: "#d97706" },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorias]);

  const handleAgregarAlCarrito = async (
    e: React.MouseEvent,
    producto: Producto,
  ) => {
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
                <Link
                  to="/byte&buy/products"
                  className="btn btn-primary btn-large"
                >
                  Explorar catálogo
                </Link>
                <Link
                  to="/byte&buy/products?destacados=true"
                  className="btn btn-ghost btn-large"
                >
                  Ver ofertas
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-number">
                    {totalProductos || "500+"}
                  </span>
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
                  src={
                    productoMasVendido?.producto_imagen ||
                    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&amp;h=800&amp;fit=crop"
                  }
                  alt={
                    productoMasVendido
                      ? `${productoMasVendido.producto_nombre}, nuestro producto más vendido`
                      : "Productos tecnológicos destacados"
                  }
                  className="hero-image"
                />
                <div className="hero-floating-card hero-floating-card-1">
                  <div className="hero-floating-icon">✓</div>
                  <div>
                    <div className="hero-floating-title">Garantía total</div>
                    <div className="hero-floating-subtitle">
                      2 años en productos
                    </div>
                  </div>
                </div>
                <div className="hero-floating-card hero-floating-card-2">
                  <div className="hero-floating-icon-truck" />
                  <div>
                    <div className="hero-floating-title">Envío gratis</div>
                    <div className="hero-floating-subtitle">
                      En de 3 articulos o mas
                    </div>
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
                <p className="feature-desc">
                  Entrega en 24-48h en pedidos confirmados
                </p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-shield" />
              <div>
                <h3 className="feature-title">Pago seguro</h3>
                <p className="feature-desc">
                  Múltiples métodos con encriptación SSL
                </p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-headset" />
              <div>
                <h3 className="feature-title">Atención 24/7</h3>
                <p className="feature-desc">
                  Equipo de soporte siempre disponible
                </p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-return" />
              <div>
                <h3 className="feature-title">Devolución fácil</h3>
                <p className="feature-desc">
                  30 días para devolver sin preguntas
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="section-container">
            <div className="about-card">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Quiénes somos
              </div>
              <h2 className="section-title">Bienvenido a Byte&amp;Buy</h2>
              <p className="about-description">
                Somos una tienda online especializada en tecnología, hogar y
                estilo de vida. Seleccionamos cuidadosamente cada producto para
                ofrecerte calidad garantizada, precios justos y una experiencia
                de compra rápida y segura, con soporte cercano en cada paso.
              </p>
              
            </div>
          </div>
        </section>

        <section className="categories-section">
          <div className="section-container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Explora por categoría</h2>
                <p className="section-subtitle">
                  Navega por nuestras colecciones destacadas
                </p>
              </div>
              <Link to="/byte&buy/products" className="section-link">
                Ver todas las categorías →
              </Link>
            </div>
            <div className="categories-grid">
              {categoriasParaMostrar.map((cat, idx) => (
                <CategoryCard
                  key={idx}
                  nombre={cat.nombre}
                  conteo={cat.cantidad}
                  color={cat.color}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="section-container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Productos destacados</h2>
                <p className="section-subtitle">
                  Los favoritos de nuestros clientes esta semana
                </p>
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
                {productosDestacados.map((producto) => (
                  <ProductCard
                    key={producto.producto_id}
                    producto={producto}
                    isUpdating={actualizandoProductoId === producto.producto_id}
                    onAgregar={handleAgregarAlCarrito}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {(loadingMasVendidos || productosMasVendidos.length > 0) && (
          <section className="bestsellers-section">
            <div className="section-container">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Los más vendidos</h2>
                  <p className="section-subtitle">
                    Los productos preferidos por nuestros clientes
                  </p>
                </div>
                <Link to="/byte&buy/products" className="section-link">
                  Ver todos los productos →
                </Link>
              </div>

              {loadingMasVendidos ? (
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
                  {productosMasVendidos.map((producto, idx) => (
                    <ProductCard
                      key={producto.producto_id}
                      producto={producto}
                      isUpdating={
                        actualizandoProductoId === producto.producto_id
                      }
                      onAgregar={handleAgregarAlCarrito}
                      rankBadge={`#${idx + 1} más vendido`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {productosConDescuento.length > 0 && (
          <section className="discounts-section">
            <div className="section-container">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Descuentos y ofertas</h2>
                  <p className="section-subtitle">
                    Aprovecha los mejores precios antes de que se acaben
                  </p>
                </div>
                <Link
                  to="/byte&buy/products?destacados=true"
                  className="section-link"
                >
                  Ver todas las ofertas →
                </Link>
              </div>
              <div className="products-grid">
                {productosConDescuento.map((producto) => (
                  <ProductCard
                    key={producto.producto_id}
                    producto={producto}
                    isUpdating={actualizandoProductoId === producto.producto_id}
                    onAgregar={handleAgregarAlCarrito}
                  />
                ))}
              </div>
            </div>
          </section>
        )}


      </main>

      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="footer-logo">Byte&amp;Buy</h3>
              <p className="footer-tagline">
                Tu tienda online de tecnología y estilo de vida. Productos de
                calidad con el mejor servicio.
              </p>
            </div>
            <div className="footer-links-cols">
              <div>
                <h4 className="footer-heading">Comprar</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/byte&buy/products" className="footer-link">
                      Catálogo
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/byte&buy/products?ofertas=true"
                      className="footer-link"
                    >
                      Ofertas
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/byte&buy/products?nuevos=true"
                      className="footer-link"
                    >
                      Novedades
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="footer-heading">Ayuda</h4>
                <ul className="footer-links">
                  <li>
                    <a className="footer-link" href="#">
                      Envíos
                    </a>
                  </li>
                  <li>
                    <a className="footer-link" href="#">
                      Devoluciones
                    </a>
                  </li>
                  <li>
                    <a className="footer-link" href="#">
                      Preguntas frecuentes
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="footer-heading">Empresa</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/byte&buy/nosotros" className="footer-link">
                      Nosotros
                    </Link>
                  </li>
                  <li>
                    <Link to="/byte&buy/contacto" className="footer-link">
                      Contacto
                    </Link>
                  </li>
                  <li>
                    <a className="footer-link" href="#">
                      Términos y condiciones
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">
              © 2026 Byte&amp;Buy. Todos los derechos reservados.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
