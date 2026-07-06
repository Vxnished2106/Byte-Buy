import { useEffect, useState } from "react";
import User from "../assets/favicon/user";
import Cart from "../assets/favicon/cart";
import "../styles/header.css";
import { Link, useNavigate } from "react-router";
import SearchRounded from "../assets/favicon/search";
import { obtenerPerfil } from "../services/usuario";
import { logout } from "../services/auth";
import { useSesion } from "../hooks/useSesion";
import { obtenerIniciales, obtenerNombreCompleto } from "../utils/usuario";

export default function Header() {
  const navigate = useNavigate();
  const { session } = useSesion();
  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [openPerfil, setOpenPerfil] = useState(false);
  const [product, setProduct] = useState<string>("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [inicialesUsuario, setInicialesUsuario] = useState("");
  const autenticado = !!session;
  const handleOpenCatalogo = () => setOpenCatalogo(!openCatalogo);
  const handleOpenPerfil = () => setOpenPerfil(!openPerfil);
  const cerrarMenuPerfil = () => setOpenPerfil(false);

  useEffect(() => {
    if (!session) {
      setNombreUsuario("");
      setInicialesUsuario("");
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
      })
      .catch(() => {
        if (vigente) {
          setNombreUsuario("");
          setInicialesUsuario("");
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
  const items = [
    {
      id: 1,
      nombre: "Ver todo",
      cantidad: 16,
      link: "/",
    },
    {
      id: 2,
      nombre: "Audio",
      cantidad: 3,
      link: "/",
    },
    {
      id: 3,
      nombre: "Computación",
      cantidad: 3,
      link: "/",
    },
    {
      id: 4,
      nombre: "Accesorios",
      cantidad: 3,
      link: "/",
    },
    {
      id: 5,
      nombre: "Móviles",
      cantidad: 1,
      link: "/",
    },
    {
      id: 6,
      nombre: "Wearables",
      cantidad: 1,
      link: "/",
    },
    {
      id: 7,
      nombre: "Gaming",
      cantidad: 2,
      link: "/",
    },
    {
      id: 8,
      nombre: "Fotografía",
      cantidad: 1,
      link: "/",
    },
    {
      id: 9,
      nombre: "Hogar",
      cantidad: 2,
      link: "/",
    },
  ];
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
              {items.map((item) => (
                <li className="items" key={item.id}>
                  <span className="item-name">{item.nombre}</span>
                  <span className="item-count">{item.cantidad}</span>
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
                    <div className="icon-user">{inicialesUsuario}</div>
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
