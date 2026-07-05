import React, { useState } from "react";
import User from "../assets/favicon/user";
import Cart from "../assets/favicon/cart";
import "../styles/header.css";
import { Link } from "react-router";
import SearchRounded from "../assets/favicon/search";
export default function Header() {
  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [openPerfil, setOpenPerfil] = useState(false);
  const [product, setProduct] = useState<string>("");
  const handleOpenCatalogo = () => setOpenCatalogo(!openCatalogo);
  const handleOpenPerfil = () => setOpenPerfil(!openPerfil);
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
              <div className="perfil-info">
                <div className="icon-user">AM</div>
                <div className="perfil-text">
                  <span className="name">Alex Morales</span>
                  <Link to={"/buy&buy/perfil"} className="ver-perfil-link">
                    Ver mi perfil
                  </Link>
                </div>
              </div>
              <div className="divider" />
              <div className="user-actions">
                <Link to={"/buy&buy/perfil"} className="link">
                  Mi perfil
                </Link>
                <Link to={"/"} className="link">
                  Mis pedidos
                </Link>
              </div>
              <div className="divider" />
              <div className="sesion-actions">
                <Link to={"/buy&buy/login"} className="link">
                  Iniciar sesion
                </Link>
                <Link to={"/buy&buy/register"} className="link">
                  Crear cuenta
                </Link>
              </div>
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
