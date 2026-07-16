import "./App.css";
import Header from "./components/Header";
import { Link } from "react-router";

function App() {
  const categoriasDestacadas = [
    {
      nombre: "Electrónica",
      imagen: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop",
    },
    {
      nombre: "Moda",
      imagen: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop",
    },
    {
      nombre: "Hogar",
      imagen: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
    },
    {
      nombre: "Deportes",
      imagen: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
    },
  ];

  const productosPopulares = [
    {
      id: 1,
      nombre: "Smartphone X Pro",
      precio: 1299.99,
      imagen: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
      descuento: 15,
    },
    {
      id: 2,
      nombre: "Zapatillas Running",
      precio: 189.99,
      imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    },
    {
      id: 3,
      nombre: "Lámpara de Escritorio",
      precio: 59.99,
      imagen: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop",
    },
    {
      id: 4,
      nombre: "Audífonos Inalámbricos",
      precio: 149.99,
      imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      descuento: 10,
    },
  ];

  return (
    <>
      <Header />
      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&h=700&fit=crop"
                alt="Bienvenido a Byte&Buy"
                className="hero-img"
              />
            </div>
            <div>
              <h1 className="hero-title">
                Compra <span className="highlight">fácil</span>, vive
                <span className="highlight"> mejor</span>
              </h1>
              <p className="hero-subtitle">
                Encuentra todo lo que necesitas en un solo lugar, con la mejor calidad y los precios más competitivos.
              </p>
              <div className="hero-cta">
                <Link to="/byte&buy/products" className="cta-button primary">
                  Ver Productos
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categorías Destacadas */}
        <section className="categories-section">
          <div className="section-header">
            <h2 className="section-title">Categorías Destacadas</h2>
            <p className="section-subtitle">Explora lo mejor de cada categoría</p>
          </div>
          <div className="categories-grid">
            {categoriasDestacadas.map((categoria, index) => (
              <Link
                key={index}
                to={`/byte&buy/products?categoria=${encodeURIComponent(categoria.nombre)}`}
                className="category-card"
              >
                <img
                  src={categoria.imagen}
                  alt={categoria.nombre}
                  className="category-image"
                />
                <div className="category-overlay">
                  <h3 className="category-name">{categoria.nombre}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Productos Populares */}
        <section className="products-section">
          <div className="section-header">
            <h2 className="section-title">Productos Populares</h2>
            <p className="section-subtitle">Lo más buscado por nuestros clientes</p>
          </div>
          <div className="products-grid">
            {productosPopulares.map((producto) => (
              <Link
                key={producto.id}
                to={`/byte&buy/products/${producto.id}`}
                className="product-card"
              >
                <div className="product-image-container">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="product-image"
                  />
                  {producto.descuento && (
                    <span className="discount-badge">-{producto.descuento}%</span>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{producto.nombre}</h3>
                  <div className="product-price-container">
                    <span className="product-price">${producto.precio.toFixed(2)}</span>
                  </div>
                  <button className="add-to-cart-btn">
                    Añadir al carrito
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Byte&Buy</h3>
            <p className="footer-text">
              Tu tienda online de confianza para encontrar todo lo que necesitas.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-subtitle">Enlaces Rápidos</h4>
            <ul className="footer-links">
              <li>
                <Link to="/byte&buy/products" className="footer-link">Productos</Link>
              </li>
              <li>
                <Link to="/byte&buy/about" className="footer-link">Nosotros</Link>
              </li>
              <li>
                <Link to="/byte&buy/contact" className="footer-link">Contacto</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-subtitle">Ayuda</h4>
            <ul className="footer-links">
              <li>
                <Link to="/byte&buy/faq" className="footer-link">Preguntas Frecuentes</Link>
              </li>
              <li>
                <Link to="/byte&buy/returns" className="footer-link">Devoluciones</Link>
              </li>
              <li>
                <Link to="/byte&buy/shipping" className="footer-link">Envíos</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 Byte&Buy. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
