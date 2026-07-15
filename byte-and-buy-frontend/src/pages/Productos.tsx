import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import "../styles/products.css";
import Header from "../components/Header";
import CardProducto from "../components/CardProducto";
import { useCatalogoProductos } from "../hooks/useCatalogoProductos";

export default function Productos() {
  const { productos, loading, error } = useCatalogoProductos();
  const [searchParams] = useSearchParams();
  const categoriaDesdeUrl = searchParams.get("categoria");
  const busquedaDesdeUrl = searchParams.get("busqueda");

  const categorias = useMemo(() => {
    const nombres = new Set<string>();
    productos.forEach((producto) =>
      producto.categorias.forEach((c) => nombres.add(c.categoria_nombre)),
    );
    return ["Todos", ...Array.from(nombres)];
  }, [productos]);

  const etiquetas = useMemo(() => {
    const nombres = new Set<string>();
    productos.forEach((producto) =>
      producto.etiquetas.forEach((e) => nombres.add(e.etiqueta_nombre)),
    );
    return Array.from(nombres);
  }, [productos]);

  const higgerPrice = useMemo(
    () =>
      productos.length
        ? Math.max(...productos.map((prod) => prod.producto_precio))
        : 0,
    [productos],
  );

  const [categoriaActiva, setCategoriaActiva] = useState(
    categoriaDesdeUrl ?? "Todos",
  );
  const [etiquetasActivas, setEtiquetasActivas] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState(busquedaDesdeUrl ?? "");

  // Sincroniza el filtro con el link "?categoria=" del menu del Header
  // (tambien cubre el caso de navegar de una categoria a otra sin
  // desmontar la pagina).
  useEffect(() => {
    setCategoriaActiva(categoriaDesdeUrl ?? "Todos");
  }, [categoriaDesdeUrl]);
  // Sincroniza el termino de busqueda con el "?busqueda=" de la barra
  // de busqueda del Header.
  useEffect(() => {
    setBusqueda(busquedaDesdeUrl ?? "");
  }, [busquedaDesdeUrl]);
  // null = el usuario no ha tocado el slider todavia; se usa higgerPrice
  // (que solo se conoce tras cargar los productos) como tope por defecto.
  const [precioMaximo, setPrecioMaximo] = useState<number | null>(null);
  const precioMaximoActivo = precioMaximo ?? higgerPrice;

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
    setPrecioMaximo(null);
    setBusqueda("");
  };

  const terminoBusqueda = busqueda.trim().toLowerCase();

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaActiva === "Todos" ||
      producto.categorias.some((c) => c.categoria_nombre === categoriaActiva);
    const coincideEtiqueta =
      etiquetasActivas.length === 0 ||
      producto.etiquetas.some((etiqueta) =>
        etiquetasActivas.includes(etiqueta.etiqueta_nombre)
      );
    const coincidePrecio = producto.producto_precio <= precioMaximoActivo;
    const coincideBusqueda =
      !terminoBusqueda ||
      producto.producto_nombre.toLowerCase().includes(terminoBusqueda) ||
      (producto.producto_descripcion ?? "")
        .toLowerCase()
        .includes(terminoBusqueda) ||
      producto.categorias.some((c) =>
        c.categoria_nombre.toLowerCase().includes(terminoBusqueda),
      ) ||
      producto.etiquetas.some((e) =>
        e.etiqueta_nombre.toLowerCase().includes(terminoBusqueda),
      );
    return (
      coincideCategoria && coincideEtiqueta && coincidePrecio && coincideBusqueda
    );
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
          {loading && (
            <p className="products-status-message">Cargando productos...</p>
          )}
          {error && (
            <p className="products-status-message products-status-error">
              {error}
            </p>
          )}
          {!loading && !error && productosFiltrados.length === 0 && (
            <p className="products-status-message">
              No hay productos que coincidan con los filtros.
            </p>
          )}
          {!loading &&
            !error &&
            productosFiltrados.map((producto) => (
              <CardProducto
                key={producto.producto_id}
                producto_id={producto.producto_id}
                imagen={producto.producto_imagen ?? ""}
                categoria={
                  producto.categorias[0]?.categoria_nombre ?? "Sin categoria"
                }
                nombre_producto={producto.producto_nombre}
                precio={producto.producto_precio}
              />
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
              value={precioMaximoActivo}
              onChange={(e) => setPrecioMaximo(Number(e.target.value))}
            />
            <span className="price-range-value">
              Hasta ${precioMaximoActivo.toFixed(2)}
            </span>
          </div>
        </aside>
      </main>
    </>
  );
}
