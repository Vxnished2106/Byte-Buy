import React, { useMemo, useState } from "react";
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
  const [filtroCategoriaId, setFiltroCategoriaId] = useState(0);
  const [filtroProveedorId, setFiltroProveedorId] = useState(0);
  const [ordenPrecio, setOrdenPrecio] = useState<"" | "asc" | "desc">("");
  const [ordenStock, setOrdenStock] = useState<"" | "asc" | "desc">("");

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
    "Precio",
    "Stock",
    "Stock Minimo",
    "Categoria",
    "Proveedor",
    "Precio de compra",
    "Descuento",
    "Impuesto",
  ];

  const productosFiltrados = useMemo(() => {
    let base = productos;
    if (filtroCategoriaId) {
      base = base.filter((row) =>
        productosCompletos
          .find((p) => p.producto_id === row.producto_id)
          ?.categorias.some((c) => c.categoria_id === filtroCategoriaId),
      );
    }
    if (filtroProveedorId) {
      base = base.filter((row) =>
        proveedoresPorProducto(row.producto_id).some(
          (a) => a.proveedor_id === filtroProveedorId,
        ),
      );
    }
    if (ordenPrecio) {
      base = [...base].sort((a, b) =>
        ordenPrecio === "asc"
          ? a.producto_precio - b.producto_precio
          : b.producto_precio - a.producto_precio,
      );
    }
    if (ordenStock) {
      base = [...base].sort((a, b) =>
        ordenStock === "asc"
          ? a.producto_stock - b.producto_stock
          : b.producto_stock - a.producto_stock,
      );
    }
    return base;
  }, [
    productos,
    productosCompletos,
    proveedoresPorProducto,
    filtroCategoriaId,
    filtroProveedorId,
    ordenPrecio,
    ordenStock,
  ]);

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
            </>
          )}
        </div>
        {vista === "productos" && alertasStock.length > 0 && (
          <div className="stock-alert-banner" role="alert">
            <svg
              className="stock-alert-icon"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="stock-alert-body">
              <span className="stock-alert-count">
                {alertasStock.length} producto
                {alertasStock.length === 1 ? "" : "s"} con stock bajo
              </span>
              {nombresStockBajo.length > 0 && (
                <div className="stock-alert-chips">
                  {nombresStockBajo.map((nombre, i) => (
                    <span className="stock-alert-chip" key={i}>
                      {nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {vista === "productos" && (
          <div className="admin-filtros">
            <select
              value={filtroCategoriaId}
              onChange={(e) => setFiltroCategoriaId(Number(e.target.value))}
              aria-label="Filtrar por categoria"
            >
              <option value={0}>Todas las categorias</option>
              {categorias.map((c) => (
                <option key={c.categoria_id} value={c.categoria_id}>
                  {c.categoria_nombre}
                </option>
              ))}
            </select>
            <select
              value={filtroProveedorId}
              onChange={(e) => setFiltroProveedorId(Number(e.target.value))}
              aria-label="Filtrar por proveedor"
            >
              <option value={0}>Todos los proveedores</option>
              {proveedores.map((p) => (
                <option key={p.proveedor_id} value={p.proveedor_id}>
                  {p.proveedor_nombre}
                </option>
              ))}
            </select>
            <select
              value={ordenPrecio}
              onChange={(e) =>
                setOrdenPrecio(e.target.value as "" | "asc" | "desc")
              }
              aria-label="Ordenar por precio"
            >
              <option value="">Precio: sin ordenar</option>
              <option value="asc">Precio: menor a mayor</option>
              <option value="desc">Precio: mayor a menor</option>
            </select>
            <select
              value={ordenStock}
              onChange={(e) =>
                setOrdenStock(e.target.value as "" | "asc" | "desc")
              }
              aria-label="Ordenar por stock"
            >
              <option value="">Stock: sin ordenar</option>
              <option value="asc">Stock: menor a mayor</option>
              <option value="desc">Stock: mayor a menor</option>
            </select>
          </div>
        )}
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
                  data={productosFiltrados}
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
