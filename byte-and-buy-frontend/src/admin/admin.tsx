import React, { useState } from "react";
import { useUsuario } from "../hooks/useUsuario";
import { obtenerIniciales, obtenerNombreCompleto } from "../utils/usuario";
import Table from "../components/Table";
import "../styles/admin.css";
export default function Admin() {
  const { usuario } = useUsuario();
  const [isProveedores, setIsProveedor] = useState(true);
  const [isProducto, setIsProducto] = useState(false);
  const proveedores_columns_name = ["Proveedor", "Contacto"];
  const producto_columns_name = ["Producto", "Categoria", "Precio"];
  const handleProveedores = () => {
    setIsProveedor(false);
    setIsProducto(true);
  };

  const handleProductos = () => {
    setIsProducto(false);
    setIsProveedor(true);
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
        <div className="admin-info">
          <div className="admin-bubble">{iniciales}</div>
          <div className="admin-data">
            <h5 className="admin-name">{nombreCompleto}</h5>
            <span className="admin-role">Administrador</span>
          </div>
        </div>
      </div>
      <section className="stats-section">
        <h1>Bienvenido al panel de administrador</h1>
      </section>
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
           {isProveedores&&(
            <Table
              title="Proveedores"
              main_button_title="Agregar Proveedor"
              columns_name={proveedores_columns_name}
              data={[]}
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
