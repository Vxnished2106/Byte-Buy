import api from "./api";
import type {
  CreateProducto,
  DetalleProducto,
  Producto,
  ProductoCatalogo,
  UpdateProducto,
} from "../ts/interfaces";

/**
 * El backend guarda producto_precio/descuento/impuesto como `decimal` en
 * MySQL, y TypeORM los devuelve como string (ej. "1200.00"), no number,
 * aunque el DTO los declare como number. Se normalizan aca, en el borde de
 * la API, para que el resto del frontend pueda confiar en el tipo `number`.
 */
function normalizarProducto<T extends Producto>(producto: T): T {
  return {
    ...producto,
    producto_precio: Number(producto.producto_precio),
    producto_descuento: Number(producto.producto_descuento),
    producto_impuesto: Number(producto.producto_impuesto),
  };
}

/** Lista productos activos, con filtros opcionales (categoría, etiqueta, nombre, rango de precio). */
export async function listarProductos(filtros?: {
  categoria_ids?: number[];
  etiqueta_ids?: number[];
  nombre?: string;
  min?: number;
  max?: number;
}): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>("/productos/filtro", {
    params: {
      nombre: filtros?.nombre,
      min: filtros?.min,
      max: filtros?.max,
      categoria_ids: filtros?.categoria_ids?.join(","),
      etiqueta_ids: filtros?.etiqueta_ids?.join(","),
    },
  });
  return data.map(normalizarProducto);
}

/** Lista el catálogo público liviano, con disponibilidad de stock por producto. */
export async function obtenerCatalogo(): Promise<ProductoCatalogo[]> {
  const { data } = await api.get<ProductoCatalogo[]>("/productos/catalogo");
  return data;
}

/** Obtiene el detalle público de un producto activo, incluido su stock. */
export async function obtenerDetalleProducto(
  producto_id: number,
): Promise<DetalleProducto> {
  const { data } = await api.get<DetalleProducto>(`/productos/${producto_id}`);
  return normalizarProducto(data);
}

/** Arma el multipart/form-data que exige el backend para crear/editar productos. */
function construirFormData(
  datos: CreateProducto | UpdateProducto,
  imagen?: File,
  banner?: File,
): FormData {
  const formData = new FormData();
  if (datos.producto_nombre !== undefined)
    formData.append("producto_nombre", datos.producto_nombre);
  if (datos.producto_descripcion !== undefined)
    formData.append("producto_descripcion", datos.producto_descripcion);
  if (datos.producto_precio !== undefined)
    formData.append("producto_precio", String(datos.producto_precio));
  if (datos.producto_impuesto !== undefined)
    formData.append("producto_impuesto", String(datos.producto_impuesto));
  if (datos.producto_descuento !== undefined)
    formData.append("producto_descuento", String(datos.producto_descuento));
  if (datos.producto_estado !== undefined)
    formData.append("producto_estado", datos.producto_estado);
  if (datos.categoria_ids !== undefined)
    formData.append("categoria_ids", datos.categoria_ids.join(","));
  if (datos.etiqueta_ids !== undefined)
    formData.append("etiqueta_ids", datos.etiqueta_ids.join(","));
  if (imagen) formData.append("producto_imagen", imagen);
  if (banner) formData.append("producto_banner", banner);
  return formData;
}

/** Registra un nuevo producto (multipart/form-data por las imágenes). */
export async function crearProducto(
  datos: CreateProducto,
  imagen?: File,
  banner?: File,
): Promise<Producto> {
  const formData = construirFormData(datos, imagen, banner);
  const { data } = await api.post<Producto>("/productos", formData, {
    headers: { "Content-Type": undefined },
    timeout: 60000, // subidas a Supabase Storage pueden tardar más que una petición JSON normal
  });
  return normalizarProducto(data);
}

/** Edita un producto existente (multipart/form-data por las imágenes). */
export async function editarProducto(
  producto_id: number,
  datos: UpdateProducto,
  imagen?: File,
  banner?: File,
): Promise<Producto> {
  const formData = construirFormData(datos, imagen, banner);
  const { data } = await api.patch<Producto>(
    `/productos/${producto_id}`,
    formData,
    {
      headers: { "Content-Type": undefined },
      timeout: 60000, // subidas a Supabase Storage pueden tardar más que una petición JSON normal
    },
  );
  return normalizarProducto(data);
}
