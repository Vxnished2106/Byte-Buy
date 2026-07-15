import { useEffect, useState } from "react";
import User from "../assets/favicon/user";
import Cart from "../assets/favicon/cart";
import "../styles/header.css";
import { Link, useNavigate } from "react-router";
import SearchRounded from "../assets/favicon/search";
import { obtenerPerfil } from "../services/usuario";
import { logout } from "../services/auth";
import { useSesion } from "../hooks/useSesion";
import { useCategoriasCatalogo } from "../hooks/useCategoriasCatalogo";
import { obtenerIniciales, obtenerNombreCompleto } from "../utils/usuario";

export default function Header() {
  const navigate = useNavigate();
  const { session } = useSesion();
  const { categorias: categoriasCatalogo, total: totalCatalogo } =
    useCategoriasCatalogo();
  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [openPerfil, setOpenPerfil] = useState(false);
  const [product, setProduct] = useState<string>("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [inicialesUsuario, setInicialesUsuario] = useState("");
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);
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
      return;
    }

    let vigente = true;
    obtenerPerfil()
      .then((usuario) => {
        if (!vigente) return;
        setNombreUsuario(
          obtenerNombreCompleto(usuario.usuario_nombre, usuario.usuario_apellido1),
        );
        setInicialesUsuario(
          obtenerIniciales(usuario.usuario_nombre, usuario.usuario_apellido1),
        );
        setFotoUsuario(usuario.usuario_foto ?? null);
      })
      .catch(() => {
        if (vigente) {
          setNombreUsuario("");
          setInicialesUsuario("");
          setFotoUsuario(null);
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
        <div className="search-bar-container">
          <SearchRounded />
          <input
            className="search-bar"
            placeholder="Buscar productos, marcas, categorias..."
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>
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
                        <img src={fotoUsuario} alt="Foto de perfil" />
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
          <Cart />
        </button>
      </div>
    </header>
  );
}
