import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useUsuario } from "../hooks/useUsuario";
import { obtenerIniciales, obtenerNombreCompleto } from "../utils/usuario";
import { logout } from "../services/auth";
import Table from "../components/Table";
import "../styles/admin.css";
export default function Admin() {
  const navigate = useNavigate();
  const { usuario } = useUsuario();
  const [isProveedores, setIsProveedor] = useState(true);
  const [isProducto, setIsProducto] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const proveedores_columns_name = [
    "Proveedor",
    "Correo",
    "Telefono",
    "Direccion",
  ];
  const producto_columns_name = ["Producto", "Categoria", "Precio", "Stock"];
  const proveedores = [
    {
      id: 1,
      nombre: "NVidia",
      telefono: "+101 56789643",
      direccion: "Ohaio, USA, wolf street",
      estado: false,
    },
    {
      id: 2,
      nombre: "Asus",
      telefono: "+101 65437890",
      direccion: "8720 Kato Rd, Fremont, CA 94538",
      estado: true,
    },
  ];
  const handleProveedores = () => {
    setIsProveedor(!isProveedores);
    setIsProducto(!isProducto);
  };

  const handleProductos = () => {
    setIsProducto(!isProducto);
    setIsProveedor(!isProveedores);
  };

  const handleToggleMenu = () => setOpenMenu(!openMenu);

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await logout();
    setOpenMenu(false);
    navigate("/byte&buy/login");
  };
  const iniciales = usuario
    ? obtenerIniciales(usuario.usuario_nombre, usuario.usuario_apellido1)
    : "";
  const nombreCompleto = usuario
    ? obtenerNombreCompleto(usuario.usuario_nombre, usuario.usuario_apellido1)
    : "";
  return (
    <div className="admin-panel-container">
      <div className="admin-panel-header">
        <div className="admin-panel-titles">
          <h5>Panel de control</h5>
          <h1>Administracion</h1>
        </div>
        <div className="admin-info" onClick={handleToggleMenu}>
          <div className="admin-bubble">{iniciales}</div>
          <div className="admin-data">
            <h5 className="admin-name">{nombreCompleto}</h5>
            <span className="admin-role">Administrador</span>
          </div>
          {openMenu && (
            <div className="admin-menu">
              <button
                type="button"
                className="admin-menu-item"
                onClick={handleLogout}
              >
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </div>
      <section className="stats-section"></section>
      <section className="table-section">
        <div className="admin-action-buttons">
          <button className="admin-action-button" onClick={handleProductos}>
            Proveedores
          </button>
          <button className="admin-action-button" onClick={handleProveedores}>
            Productos
          </button>
        </div>
        <div className="table">
          {isProveedores && (
            <Table
              title="Proveedores"
              main_button_title="Agregar Proveedor"
              columns_name={proveedores_columns_name}
              data={proveedores}
              onAction_main_button={() => console.log("Tabla de proveedores")}
            />
          )}
          {isProducto && (
            <Table
              title="Productos"
              main_button_title="Agregar Producto"
              columns_name={producto_columns_name}
              data={[]}
              onAction_main_button={() => console.log("Tabla de productos")}
            />
          )}
        </div>
      </section>
    </div>
  );
}
