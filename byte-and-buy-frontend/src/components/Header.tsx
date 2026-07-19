import { useEffect, useMemo, useState } from "react";
import User from "../assets/favicon/user";
import Cart from "../assets/favicon/cart";
import "../styles/header.css";
import { Link, useNavigate } from "react-router";
import SearchRounded from "../assets/favicon/search";
import { obtenerPerfil } from "../services/usuario";
import { logout } from "../services/auth";
import { useSesion } from "../hooks/useSesion";
import { useCarrito } from "../hooks/useCarrito";
import { useCategoriasCatalogo } from "../hooks/useCategoriasCatalogo";
import { useCatalogoProductos } from "../hooks/useCatalogoProductos";
import { obtenerIniciales, obtenerNombreCompleto } from "../utils/usuario";
import { Rol } from "../ts/interfaces";

const MAX_SUGERENCIAS = 6;

export default function Header() {
  const navigate = useNavigate();
  const { session } = useSesion();
  const { cantidadTotal } = useCarrito();
  const { categorias: categoriasCatalogo, total: totalCatalogo } =
    useCategoriasCatalogo();
  const { productos } = useCatalogoProductos();
  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [openPerfil, setOpenPerfil] = useState(false);
  const [product, setProduct] = useState<string>("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [inicialesUsuario, setInicialesUsuario] = useState("");
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const autenticado = !!session;
  const handleOpenCatalogo = () => setOpenCatalogo(!openCatalogo);
  const handleOpenPerfil = () => setOpenPerfil(!openPerfil);
  const cerrarMenuPerfil = () => setOpenPerfil(false);
  const cerrarMenuCatalogo = () => setOpenCatalogo(false);

  useEffect(() => {
    if (!session) {
      setNombreUsuario("");
      setInicialesUsuario("");
      setFotoUsuario(null);
      setEsAdmin(false);
      return;
    }

    let vigente = true;
    obtenerPerfil()
      .then((usuario) => {
        if (!vigente) return;
        setNombreUsuario(
          obtenerNombreCompleto(
            usuario.usuario_nombre,
            usuario.usuario_apellido1,
          ),
        );
        setInicialesUsuario(
          obtenerIniciales(usuario.usuario_nombre, usuario.usuario_apellido1),
        );
        setFotoUsuario(usuario.usuario_foto ?? null);
        setEsAdmin(usuario.usuario_rol === Rol.ADMIN);
      })
      .catch(() => {
        if (vigente) {
          setNombreUsuario("");
          setInicialesUsuario("");
          setFotoUsuario(null);
          setEsAdmin(false);
        }
      });

    return () => {
      vigente = false;
    };
  }, [session]);

  const handleLogout = async () => {
    await logout();
    cerrarMenuPerfil();
    navigate("/");
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    irAResultados(product);
  };

  const irAResultados = (termino: string) => {
    const valor = termino.trim();
    setMostrarSugerencias(false);
    navigate(
      valor
        ? `/byte&buy/products?busqueda=${encodeURIComponent(valor)}`
        : "/byte&buy/products",
    );
  };

  const terminoBusqueda = product.trim().toLowerCase();

  const sugerencias = useMemo(() => {
    if (!terminoBusqueda) return [];
    return productos
      .filter(
        (producto) =>
          producto.producto_nombre.toLowerCase().includes(terminoBusqueda) ||
          (producto.producto_descripcion ?? "")
            .toLowerCase()
            .includes(terminoBusqueda) ||
          producto.categorias.some((c) =>
            c.categoria_nombre.toLowerCase().includes(terminoBusqueda),
          ) ||
          producto.etiquetas.some((e) =>
            e.etiqueta_nombre.toLowerCase().includes(terminoBusqueda),
          ),
      )
      .slice(0, MAX_SUGERENCIAS);
  }, [productos, terminoBusqueda]);

  const handleSeleccionarSugerencia = (productoId: number) => {
    setMostrarSugerencias(false);
    navigate(`/byte&buy/products/${productoId}`);
  };
  return (
    <header>
      <Link to={"/"} className="link">
        <h4 className="title">
          <span className="B">B</span>yte<span>&</span>
          <span className="B">B</span>uy
        </h4>
      </Link>
      <div className="search-options">
        <button
          className={`catalog${openCatalogo ? " open" : ""}`}
          onClick={handleOpenCatalogo}
        >
          {" "}
          Catalogo
        </button>
        {openCatalogo && (
          <div className="items-container">
            <ul>
              <li className="items">
                <Link
                  to={"/byte&buy/products"}
                  className="item-link"
                  onClick={cerrarMenuCatalogo}
                >
                  <span className="item-name">Ver todo</span>
                  <span className="item-count">{totalCatalogo}</span>
                </Link>
              </li>
              {categoriasCatalogo.map((categoria) => (
                <li className="items" key={categoria.nombre}>
                  <Link
                    to={`/byte&buy/products?categoria=${encodeURIComponent(categoria.nombre)}`}
                    className="item-link"
                    onClick={cerrarMenuCatalogo}
                  >
                    <span className="item-name">{categoria.nombre}</span>
                    <span className="item-count">{categoria.cantidad}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <form className="search-bar-container" onSubmit={handleBuscar}>
          <button
            type="submit"
            className="search-bar-button"
            aria-label="Buscar"
          >
            <SearchRounded />
          </button>
          <input
            className="search-bar"
            placeholder="Buscar productos, marcas, categorias..."
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            onFocus={() => setMostrarSugerencias(true)}
            onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
          />
          {mostrarSugerencias && terminoBusqueda && (
            <div className="search-suggestions">
              {sugerencias.length > 0 ? (
                <>
                  <ul>
                    {sugerencias.map((producto) => (
                      <li
                        key={producto.producto_id}
                        className="suggestion-item"
                      >
                        <button
                          type="button"
                          className="suggestion-link"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            handleSeleccionarSugerencia(producto.producto_id)
                          }
                        >
                          <span className="suggestion-image">
                            {producto.producto_imagen && (
                              <img
                                src={producto.producto_imagen}
                                alt={producto.producto_nombre}
                                loading="lazy"
                              />
                            )}
                          </span>
                          <span className="suggestion-info">
                            <span className="suggestion-name">
                              {producto.producto_nombre}
                            </span>
                            <span className="suggestion-price">
                              ${producto.producto_precio.toFixed(2)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="suggestion-ver-todo"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => irAResultados(product)}
                  >
                    Ver todos los resultados
                  </button>
                </>
              ) : (
                <p className="suggestion-empty">No se encontraron productos</p>
              )}
            </div>
          )}
        </form>
      </div>
      <div className="action-buttons">
        <div className="user-menu">
          <button className="action-button user" onClick={handleOpenPerfil}>
            <User />
          </button>
          {openPerfil && (
            <div className="item-container-user">
              {autenticado ? (
                <>
                  <div className="perfil-info">
                    <div className="icon-user">
                      {fotoUsuario ? (
                        <img
                          src={fotoUsuario}
                          alt="Foto de perfil"
                          loading="lazy"
                        />
                      ) : (
                        inicialesUsuario
                      )}
                    </div>
                    <div className="perfil-text">
                      <span className="name">{nombreUsuario}</span>
                      <Link
                        to={"/byte&buy/perfil"}
                        className="ver-perfil-link"
                        onClick={cerrarMenuPerfil}
                      >
                        Ver mi perfil
                      </Link>
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="user-actions">
                    <Link
                      to={"/byte&buy/perfil"}
                      className="link"
                      onClick={cerrarMenuPerfil}
                    >
                      Mi perfil
                    </Link>
                    <Link to={"/"} className="link" onClick={cerrarMenuPerfil}>
                      Mis pedidos
                    </Link>
                    {esAdmin && (
                      <Link
                        to={"/byte&buy/admin"}
                        className="link"
                        onClick={cerrarMenuPerfil}
                      >
                        Volver al panel de administracion
                      </Link>
                    )}
                  </div>
                  <div className="divider" />
                  <div className="sesion-actions">
                    <button
                      type="button"
                      className="link"
                      onClick={handleLogout}
                    >
                      Cerrar sesion
                    </button>
                  </div>
                </>
              ) : (
                <div className="sesion-actions">
                  <Link
                    to={"/byte&buy/login"}
                    className="link"
                    onClick={cerrarMenuPerfil}
                  >
                    Iniciar sesion
                  </Link>
                  <Link
                    to={"/byte&buy/register"}
                    className="link"
                    onClick={cerrarMenuPerfil}
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        <button className="action-button cart">
          <Link to={"/byte&buy/carrito"}>
            <Cart />
            {cantidadTotal > 0 && (
              <span className="cart-badge">
                {cantidadTotal > 99 ? "99+" : cantidadTotal}
              </span>
            )}
          </Link>
        </button>
      </div>
    </header>
  );
}
