import { useState } from "react";
import "../styles/products.css";
import Header from "../components/Header";
import CardProducto from "../components/CardProducto";

export default function Productos() {
  const categorias = [
    "Todos",
    "Audio",
    "Computacion",
    "Accesorios",
    "moviles",
    "werables",
    "Gaming",
    "Fotografia",
    "Hogar",
  ];
  const etiquetas = ["Inalambrico", "Popular", "Premium", "Portatil", "Gaming"];
  const productosMock = [
    {
      imagen:
        "https://www.steren.cr/media/catalog/product/cache/bb0cad18a6adb5d17b0efd58f4201a2f/image/229539d37/audifonos-bluetooth-multipunto-con-active-noise-cancelling.jpg",
      categoria: "Audio",
      nombre_producto: "Audifonos Inalambricos Bluetooth",
      precio: 25.99,
      etiquetas: ["Inalambrico", "Popular"],
    },
    {
      imagen: "https://cyberteamcr.com/wp-content/uploads/2024/02/162D6LA-6.webp",
      categoria: "Computacion",
      nombre_producto: "Laptop Gamer 16GB RAM",
      precio: 899.99,
      etiquetas: ["Premium", "Portatil"],
    },
    {
      imagen: "https://m.media-amazon.com/images/I/61QY3V6A-NL._SY500_.jpg",
      categoria: "Accesorios",
      nombre_producto: "Mouse Optico RGB",
      precio: 15.5,
      etiquetas: ["Popular"],
    },
    {
      imagen: "https://m.media-amazon.com/images/I/71jbE08QOLL.jpg",
      categoria: "moviles",
      nombre_producto: "Smartphone 128GB",
      precio: 349.0,
      etiquetas: ["Premium", "Portatil"],
    },
    {
      imagen: "https://walmartcr.vtexassets.com/arquivos/ids/765547/85877_01.jpg?v=638661822772000000",
      categoria: "werables",
      nombre_producto: "Smartwatch Deportivo",
      precio: 59.9,
      etiquetas: ["Inalambrico", "Popular"],
    },
    {
      imagen: "https://extremetechcr.com/wp-content/uploads/2024/11/34970.jpg",
      categoria: "Gaming",
      nombre_producto: "Control Inalambrico para Consola",
      precio: 34.99,
      etiquetas: ["Gaming", "Popular"],
    },
    {
      imagen: "https://www.sony.co.cr/image/2ea19010a696190117f57f7a666e7230?fmt=png-alpha&wid=660&hei=660",
      categoria: "Fotografia",
      nombre_producto: "Camara Digital 20MP",
      precio: 199.0,
      etiquetas: ["Premium"],
    },
    {
      imagen: "https://cr.epaenlinea.com/media/catalog/product/1/0/100012841.jpg_20250715192707642695.jpeg?optimize=medium&bg-color=255,255,255&fit=bounds&height=&width=",
      categoria: "Hogar",
      nombre_producto: "Aspiradora Robot Inteligente",
      precio: 149.99,
      etiquetas: ["Premium"],
    },
  ];
  const higgerPrice = Math.max(...productosMock.map((prod) => prod.precio));

  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [etiquetasActivas, setEtiquetasActivas] = useState<string[]>([]);
  const [precioMaximo, setPrecioMaximo] = useState(higgerPrice);

  const toggleCategoria = (categoria: string) => {
    if (categoria === "Todos") {
      setCategoriaActiva("Todos");
      return;
    }
    setCategoriaActiva((prev) => (prev === categoria ? "Todos" : categoria));
  };

  const toggleEtiqueta = (etiqueta: string) => {
    setEtiquetasActivas((prev) =>
      prev.includes(etiqueta)
        ? prev.filter((e) => e !== etiqueta)
        : [...prev, etiqueta]
    );
  };

  const limpiarFiltros = () => {
    setCategoriaActiva("Todos");
    setEtiquetasActivas([]);
    setPrecioMaximo(higgerPrice);
  };

  const productosFiltrados = productosMock.filter((producto) => {
    const coincideCategoria =
      categoriaActiva === "Todos" || producto.categoria === categoriaActiva;
    const coincideEtiqueta =
      etiquetasActivas.length === 0 ||
      producto.etiquetas.some((etiqueta) =>
        etiquetasActivas.includes(etiqueta)
      );
    const coincidePrecio = producto.precio <= precioMaximo;
    return coincideCategoria && coincideEtiqueta && coincidePrecio;
  });

  return (
    <>
      <Header />
      <div className="products-titles-container">
        <h1>Catalogo</h1>
        <span className="cantidad-productos">
          {productosFiltrados.length} productos
        </span>
      </div>
      <div className="categoria-section">
        <ul>
          {categorias.map((categoria) => (
            <li
              key={categoria}
              className={categoriaActiva === categoria ? "active" : ""}
              onClick={() => toggleCategoria(categoria)}
            >
              {categoria}
            </li>
          ))}
        </ul>
      </div>
      <main className="products">
        <section className="products-grid">
          {productosFiltrados.map((producto, index) => (
            <CardProducto key={index} {...producto} />
          ))}
        </section>
        <aside className="filter-section">
          <div className="filter-section">
            <h4>Filtros</h4>
            <span onClick={limpiarFiltros}>Limpiar</span>
          </div>
          <div className="filter-section-categories">
            <h6>Categoria</h6>
            {categorias.map((categoria) => (
              <div
                className={`filter-categories ${
                  categoriaActiva === categoria ? "active" : ""
                }`}
                key={categoria}
                onClick={() => toggleCategoria(categoria)}
              >
                <input
                  type="radio"
                  checked={categoriaActiva === categoria}
                  onChange={() => {}}
                />
                <label>{categoria}</label>
              </div>
            ))}
          </div>
          <div className="filter-section-tags">
            <h6>Etiquetas</h6>
            <ul>
              {etiquetas.map((etiqueta) => (
                <li
                  key={etiqueta}
                  className={
                    etiquetasActivas.includes(etiqueta) ? "active" : ""
                  }
                  onClick={() => toggleEtiqueta(etiqueta)}
                >
                  {etiqueta}
                </li>
              ))}
            </ul>
          </div>
          <div className="filter-section-price">
            <h6>Rango de precio</h6>
            <input
              type="range"
              min={0}
              max={higgerPrice}
              value={precioMaximo}
              onChange={(e) => setPrecioMaximo(Number(e.target.value))}
            />
            <span className="price-range-value">
              Hasta ${precioMaximo.toFixed(2)}
            </span>
          </div>
        </aside>
      </main>
    </>
  );
}
