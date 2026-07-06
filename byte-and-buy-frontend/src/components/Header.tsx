import React, { useEffect, useState } from "react";
import User from "../assets/favicon/user";
import Cart from "../assets/favicon/cart";
import "../styles/header.css";
import { Link, useNavigate } from "react-router";
import SearchRounded from "../assets/favicon/search";
import { supabase } from "../services/supabaseClient";
import { obtenerPerfil } from "../services/usuario";
import { logout } from "../services/auth";

export default function Header() {
  const navigate = useNavigate();
  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [openPerfil, setOpenPerfil] = useState(false);
  const [product, setProduct] = useState<string>("");
  const [autenticado, setAutenticado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [inicialesUsuario, setInicialesUsuario] = useState("");
  const handleOpenCatalogo = () => setOpenCatalogo(!openCatalogo);
  const handleOpenPerfil = () => setOpenPerfil(!openPerfil);
  const cerrarMenuPerfil = () => setOpenPerfil(false);

  useEffect(() => {
    let vigente = true;

    const cargarUsuario = async (haySesion: boolean) => {
      if (!haySesion) {
        if (vigente) {
          setAutenticado(false);
          setNombreUsuario("");
          setInicialesUsuario("");
        }
        return;
      }
      try {
        const usuario = await obtenerPerfil();
        if (!vigente) return;
        setAutenticado(true);
        setNombreUsuario(
          [usuario.usuario_nombre, usuario.usuario_apellido1]
            .filter(Boolean)
            .join(" "),
        );
        setInicialesUsuario(
          [usuario.usuario_nombre, usuario.usuario_apellido1]
            .filter(Boolean)
            .map((palabra) => palabra[0])
            .join("")
            .toUpperCase(),
        );
      } catch {
        if (vigente) setAutenticado(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      cargarUsuario(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        cargarUsuario(!!session);
      },
    );

    return () => {
      vigente = false;
      listener.subscription.unsubscribe();
    };
  }, []);

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
