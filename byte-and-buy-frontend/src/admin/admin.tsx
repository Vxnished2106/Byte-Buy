import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useUsuario } from "../hooks/useUsuario";
import { useProveedores } from "../hooks/useProveedores";
import { useProductos } from "../hooks/useProductos";
import { useCategorias } from "../hooks/useCategorias";
import { useEtiquetas } from "../hooks/useEtiquetas";
import { useAlertasStock } from "../hooks/useAlertasStock";
import { obtenerIniciales, obtenerNombreCompleto } from "../utils/usuario";
import { logout } from "../services/auth";
import Table from "../components/Table";
import ProveedorModalForm from "../components/ProveedorModalForm";
import ProductoModalForm from "../components/ProductoModalForm";
import CategoriaModalForm from "../components/CategoriaModalForm";
import EtiquetaModalForm from "../components/EtiquetaModalForm";
import type {
  proveedorData,
  productoData,
  ProductoFormValues,
  CreateCategoria,
  CreateEtiqueta,
} from "../ts/interfaces";
import "../styles/admin.css";

/**
 * Panel de administración.
 * Permite gestionar proveedores, productos, categorías y etiquetas.
 */
export default function Admin() {
  const navigate = useNavigate();
  const { usuario } = useUsuario();
  const [vista, setVista] = useState<"proveedores" | "productos">(
    "proveedores",
  );
  const [openMenu, setOpenMenu] = useState(false);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showEtiquetaModal, setShowEtiquetaModal] = useState(false);
  const [editingProveedor, setEditingProveedor] =
    useState<proveedorData | null>(null);
  const [editingProducto, setEditingProducto] =
    useState<ProductoFormValues | null>(null);

  const {
    proveedores,
    loading: cargandoProveedores,
    error: errorProveedores,
    guardar: guardarProveedor,
    cambiarEstado: cambiarEstadoProveedor,
  } = useProveedores();

  const {
    productos,
    productosCompletos,
    loading: cargandoProductos,
    error: errorProductos,
    guardar: guardarProducto,
    cambiarEstado: cambiarEstadoProducto,
    inventarioPorProducto,
    proveedoresPorProducto,
  } = useProductos();

  const { categorias, crear: crearCategoria } = useCategorias();
  const { etiquetas, crear: crearEtiqueta } = useEtiquetas();
  const { alertas: alertasStock, recargar: recargarAlertasStock } =
    useAlertasStock();

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
    "Precio",
    "Stock",
    "Stock Minimo",
    "Categoria",
    "Proveedor",
    "Precio de compra",
    "Descuento",
    "Impuesto",
  ];

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

  const handleSaveProveedor = async (data: proveedorData) => {
    await guardarProveedor(data.proveedor_id, {
      proveedor_nombre: data.proveedor_nombre,
      proveedor_correo: data.proveedor_correo || undefined,
      proveedor_telefono: data.proveedor_telefono || undefined,
      proveedor_direccion: data.proveedor_direccion || undefined,
    });
    setShowProveedorModal(false);
  };

  const handleToggleEstadoProveedor = async (data: proveedorData) => {
    await cambiarEstadoProveedor(data.proveedor_id);
  };

  const handleAddProducto = () => {
    setEditingProducto(null);
    setShowProductoModal(true);
  };

  const handleEditProducto = (row: productoData) => {
    const productoCompleto = productosCompletos.find(
      (p) => p.producto_id === row.producto_id,
    );
    if (!productoCompleto) return;
    const inventario = inventarioPorProducto(row.producto_id);
    const asignacionProveedor = proveedoresPorProducto(row.producto_id)[0];
    setEditingProducto({
      producto_id: productoCompleto.producto_id,
      producto_nombre: productoCompleto.producto_nombre,
      producto_descripcion: productoCompleto.producto_descripcion ?? "",
      producto_precio: productoCompleto.producto_precio,
      producto_descuento: productoCompleto.producto_descuento,
      producto_impuesto: productoCompleto.producto_impuesto,
      producto_imagen: productoCompleto.producto_imagen ?? "",
      producto_banner: productoCompleto.producto_banner ?? "",
      producto_estado: productoCompleto.producto_estado === "activo",
      categoria_ids: productoCompleto.categorias.map((c) => c.categoria_id),
      etiqueta_ids: productoCompleto.etiquetas.map((e) => e.etiqueta_id),
      stock_actual: inventario?.inventario_stock_actual ?? 0,
      stock_minimo: inventario?.inventario_stock_minimo ?? 0,
      proveedor_id: asignacionProveedor?.proveedor_id ?? 0,
      precio_compra: asignacionProveedor?.producto_proveedor_precio ?? 0,
    });
    setShowProductoModal(true);
  };

  const handleSaveProducto = async (form: ProductoFormValues) => {
    const imagen =
      form.producto_imagen instanceof File ? form.producto_imagen : undefined;
    const banner =
      form.producto_banner instanceof File ? form.producto_banner : undefined;
    await guardarProducto(
      form.producto_id,
      {
        producto_nombre: form.producto_nombre,
        producto_descripcion: form.producto_descripcion,
        producto_precio: form.producto_precio,
        producto_descuento: form.producto_descuento,
        producto_impuesto: form.producto_impuesto,
        producto_estado: form.producto_estado ? "activo" : "inactivo",
        categoria_ids: form.categoria_ids,
        etiqueta_ids: form.etiqueta_ids,
      },
      { stock_actual: form.stock_actual, stock_minimo: form.stock_minimo },
      form.proveedor_id
        ? { proveedor_id: form.proveedor_id, precio_compra: form.precio_compra }
        : null,
      imagen,
      banner,
    );
    await recargarAlertasStock();
    setShowProductoModal(false);
  };

  const handleToggleEstadoProducto = async (row: productoData) => {
    await cambiarEstadoProducto(row.producto_id, row.producto_estado);
  };

  const handleAddCategoria = () => setShowCategoriaModal(true);

  const handleSaveCategoria = async (datos: CreateCategoria, imagen?: File) => {
    await crearCategoria(datos, imagen);
    setShowCategoriaModal(false);
  };

  const handleAddEtiqueta = () => setShowEtiquetaModal(true);

  const handleSaveEtiqueta = async (datos: CreateEtiqueta) => {
    await crearEtiqueta(datos);
    setShowEtiquetaModal(false);
  };

  const nombresStockBajo = alertasStock
    .map(
      (inv) =>
        productosCompletos.find((p) => p.producto_id === inv.producto_id)
          ?.producto_nombre,
    )
    .filter((nombre): nombre is string => Boolean(nombre));

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
              <Link
                to="/"
                className="admin-menu-item"
                onClick={(e) => e.stopPropagation()}
              >
                Ir a la tienda
              </Link>
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
      <section className="table-section">
        <div className="admin-action-buttons">
          <button
            className="admin-action-button"
            onClick={() => setVista("proveedores")}
          >
            Proveedores
          </button>
          <button
            className="admin-action-button"
            onClick={() => setVista("productos")}
          >
            Productos
          </button>
          {vista === "productos" && (
            <>
              <button
                className="admin-action-button"
                onClick={handleAddCategoria}
              >
                Nueva Categoria
              </button>
              <button
                className="admin-action-button"
                onClick={handleAddEtiqueta}
              >
                Nueva Etiqueta
              </button>
              {alertasStock.length > 0 && (
                <div className="stock-alert-banner">
                  <span className="stock-alert-count">
                    {alertasStock.length} producto
                    {alertasStock.length === 1 ? "" : "s"} con stock bajo
                  </span>
                  {nombresStockBajo.length > 0 && (
                    <span className="stock-alert-list">
                      {nombresStockBajo.join(", ")}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="table">
          {vista === "proveedores" && (
            <>
              {errorProveedores && (
                <p className="admin-status-message admin-status-error">
                  {errorProveedores}
                </p>
              )}
              {cargandoProveedores ? (
                <p className="admin-status-message">Cargando proveedores...</p>
              ) : (
                <Table
                  title="Proveedores"
                  main_button_title="Agregar Proveedor"
                  columns_name={proveedores_columns_name}
                  data={proveedores}
                  onAction_main_button={handleAddProveedor}
                  onEdit={handleEditProveedor}
                  onToggleEstado={handleToggleEstadoProveedor}
                />
              )}
            </>
          )}
          {vista === "productos" && (
            <>
              {errorProductos && (
                <p className="admin-status-message admin-status-error">
                  {errorProductos}
                </p>
              )}
              {cargandoProductos ? (
                <p className="admin-status-message">Cargando productos...</p>
              ) : (
                <Table
                  title="Productos"
                  main_button_title="Agregar Producto"
                  columns_name={producto_columns_name}
                  data={productos}
                  onAction_main_button={handleAddProducto}
                  onEdit={handleEditProducto}
                  onToggleEstado={handleToggleEstadoProducto}
                  hideToggleEstado
                />
              )}
            </>
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
          categorias={categorias}
          etiquetas={etiquetas}
          proveedores={proveedores}
          onClose={() => setShowProductoModal(false)}
          onSave={handleSaveProducto}
        />
      )}
      {showCategoriaModal && (
        <CategoriaModalForm
          onClose={() => setShowCategoriaModal(false)}
          onSave={handleSaveCategoria}
        />
      )}
      {showEtiquetaModal && (
        <EtiquetaModalForm
          onClose={() => setShowEtiquetaModal(false)}
          onSave={handleSaveEtiqueta}
        />
      )}
    </div>
  );
}
