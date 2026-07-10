import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useUsuario } from "../hooks/useUsuario";
import { obtenerIniciales, obtenerNombreCompleto } from "../utils/usuario";
import { logout } from "../services/auth";
import Table from "../components/Table";
import ProveedorModalForm from "../components/ProveedorModalForm";
import ProductoModalForm from "../components/ProductoModalForm";
import type { proveedorData, productoData } from "../ts/interfaces";
import "../styles/admin.css";
export default function Admin() {
  const navigate = useNavigate();
  const { usuario } = useUsuario();
  const [isProveedores, setIsProveedor] = useState(true);
  const [isProducto, setIsProducto] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [editingProveedor, setEditingProveedor] =
    useState<proveedorData | null>(null);
  const [editingProducto, setEditingProducto] =
    useState<productoData | null>(null);

  const proveedores_columns_name = [
    "ID",
    "Proveedor",
    "Correo",
    "Telefono",
    "Direccion",
  ];
  const producto_columns_name = [
    "ID",
    "Producto",
    "Descripcion",
    "Stock",
    "Categoria",
    "Descuento",
    "Impuesto",
    "Imagen",
    "Banner",
  ];

  const [proveedores, setProveedores] = useState<proveedorData[]>([
    {
      proveedor_id: 1,
      proveedor_nombre: "NVidia",
      proveedor_correo: "contacto@nvidia.com",
      proveedor_telefono: "+101 56789643",
      proveedor_direccion: "Ohaio, USA, wolf street",
      proveedor_estado: false,
    },
    {
      proveedor_id: 2,
      proveedor_nombre: "Asus",
      proveedor_correo: "ventas@asus.com",
      proveedor_telefono: "+101 65437890",
      proveedor_direccion: "8720 Kato Rd, Fremont, CA 94538",
      proveedor_estado: true,
    },
  ]);

  const [productos, setProductos] = useState<productoData[]>([
    {
      producto_id: 1,
      producto_nombre: "Auriculares Aura Pro",
      producto_descripcion: "Auriculares inalambricos con cancelacion de ruido",
      producto_categoria: "Audio",
      producto_descuento: 10,
      producto_impuesto: 13,
      producto_imagen: "https://placehold.co/80x80",
      producto_banner: "https://placehold.co/400x120",
      producto_estado: true,
    },
    {
      producto_id: 2,
      producto_nombre: "Tarjeta Grafica RTX 5090",
      producto_descripcion: "Tarjeta grafica de alto rendimiento",
      producto_categoria: "Componentes",
      producto_descuento: 0,
      producto_impuesto: 13,
      producto_imagen: "https://placehold.co/80x80",
      producto_banner: "https://placehold.co/400x120",
      producto_estado: false,
    },
  ]);

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

  const handleAddProveedor = () => {
    setEditingProveedor(null);
    setShowProveedorModal(true);
  };

  const handleEditProveedor = (proveedor: proveedorData) => {
    setEditingProveedor(proveedor);
    setShowProveedorModal(true);
  };

  const handleSaveProveedor = (data: proveedorData) => {
    setProveedores((prev) => {
      const exists = prev.some((p) => p.proveedor_id === data.proveedor_id);
      if (exists) {
        return prev.map((p) =>
          p.proveedor_id === data.proveedor_id ? data : p,
        );
      }
      const nextId = prev.reduce((max, p) => Math.max(max, p.proveedor_id), 0) + 1;
      return [...prev, { ...data, proveedor_id: nextId }];
    });
    setShowProveedorModal(false);
  };

  const handleAddProducto = () => {
    setEditingProducto(null);
    setShowProductoModal(true);
  };

  const handleEditProducto = (producto: productoData) => {
    setEditingProducto(producto);
    setShowProductoModal(true);
  };

  const handleSaveProducto = (data: productoData) => {
    setProductos((prev) => {
      const exists = prev.some((p) => p.producto_id === data.producto_id);
      if (exists) {
        return prev.map((p) => (p.producto_id === data.producto_id ? data : p));
      }
      const nextId = prev.reduce((max, p) => Math.max(max, p.producto_id), 0) + 1;
      return [...prev, { ...data, producto_id: nextId }];
    });
    setShowProductoModal(false);
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
              onAction_main_button={handleAddProveedor}
              onEdit={handleEditProveedor}
              onToggleEstado={handleSaveProveedor}
            />
          )}
          {isProducto && (
            <Table
              title="Productos"
              main_button_title="Agregar Producto"
              columns_name={producto_columns_name}
              data={productos}
              onAction_main_button={handleAddProducto}
              onEdit={handleEditProducto}
              onToggleEstado={handleSaveProducto}
            />
          )}
        </div>
      </section>
      {showProveedorModal && (
        <ProveedorModalForm
          initialData={editingProveedor}
          onClose={() => setShowProveedorModal(false)}
          onSave={handleSaveProveedor}
        />
      )}
      {showProductoModal && (
        <ProductoModalForm
          initialData={editingProducto}
          onClose={() => setShowProductoModal(false)}
          onSave={handleSaveProducto}
        />
      )}
    </div>
  );
}
