import { useCallback, useEffect, useState } from "react";
import { crearInventario, editarInventario, listarInventario } from "../services/inventario";
import { crearProducto, editarProducto, listarProductos } from "../services/producto";
import {
  actualizarPrecioCompra,
  asignarProveedor,
  eliminarAsignacionProveedor,
  listarProveedoresPorProducto,
} from "../services/producto-proveedor";
import type {
  CreateProducto,
  Inventario,
  Producto,
  ProductoProveedor,
  productoData,
  UpdateProducto,
} from "../ts/interfaces";

function toRow(
  producto: Producto,
  inventario?: Inventario,
  asignaciones: ProductoProveedor[] = [],
): productoData {
  return {
    producto_id: producto.producto_id,
    producto_nombre: producto.producto_nombre,
    producto_descripcion: producto.producto_descripcion ?? "",
    producto_precio: producto.producto_precio,
    producto_stock: inventario?.inventario_stock_actual ?? 0,
    producto_stock_minimo: inventario?.inventario_stock_minimo ?? 0,
    producto_categoria:
      producto.categorias?.map((c) => c.categoria_nombre).join(", ") ||
      "Sin categoria",
    producto_proveedor:
      asignaciones
        .map((a) => a.proveedor?.proveedor_nombre)
        .filter(Boolean)
        .join(", ") || "Sin proveedor",
    producto_precio_compra: asignaciones.length
      ? asignaciones
          .map((a) => `$${a.producto_proveedor_precio}`)
          .join(", ")
      : "-",
    producto_descuento: producto.producto_descuento,
    producto_impuesto: producto.producto_impuesto,
    producto_imagen: producto.producto_imagen ?? "",
    producto_banner: producto.producto_banner ?? "",
    producto_estado: producto.producto_estado === "activo",
  };
}

/**
 * Combina productos e inventario (la vista "Productos" del panel es en
 * realidad el inventario) y expone las acciones de creación/edición,
 * manteniendo ambos en sincronía tras cada cambio.
 */
export function useProductos() {
  const [productosCompletos, setProductosCompletos] = useState<Producto[]>([]);
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [asignacionesProveedor, setAsignacionesProveedor] = useState<
    ProductoProveedor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listaProductos, listaInventarios] = await Promise.all([
        listarProductos(),
        listarInventario(),
      ]);
      setProductosCompletos(listaProductos);
      setInventarios(listaInventarios);

      // No existe un endpoint que liste todas las asignaciones producto-
      // proveedor de una vez, así que se consulta una por producto.
      const listasProveedor = await Promise.all(
        listaProductos.map((p) => listarProveedoresPorProducto(p.producto_id)),
      );
      setAsignacionesProveedor(listasProveedor.flat());
    } catch {
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const inventarioPorProducto = useCallback(
    (producto_id: number) =>
      inventarios.find((i) => i.producto_id === producto_id),
    [inventarios],
  );

  const proveedoresPorProducto = useCallback(
    (producto_id: number) =>
      asignacionesProveedor.filter((a) => a.producto_id === producto_id),
    [asignacionesProveedor],
  );

  const guardar = useCallback(
    async (
      producto_id: number,
      datos: CreateProducto | UpdateProducto,
      stock: { stock_actual: number; stock_minimo: number },
      proveedor: { proveedor_id: number; precio_compra: number } | null,
      imagen?: File,
      banner?: File,
    ) => {
      const productoGuardado = producto_id
        ? await editarProducto(producto_id, datos, imagen, banner)
        : await crearProducto(datos as CreateProducto, imagen, banner);

      const inventarioExistente = inventarioPorProducto(
        productoGuardado.producto_id,
      );
      if (inventarioExistente) {
        await editarInventario(inventarioExistente.inventario_id, {
          inventario_stock_actual: stock.stock_actual,
          inventario_stock_minimo: stock.stock_minimo,
        });
      } else {
        await crearInventario({
          producto_id: productoGuardado.producto_id,
          inventario_stock_actual: stock.stock_actual,
          inventario_stock_minimo: stock.stock_minimo,
        });
      }

      // Se asume un solo proveedor "actual" por producto: la primera
      // asignación activa que ya exista para él.
      const asignacionExistente = proveedoresPorProducto(
        productoGuardado.producto_id,
      )[0];

      if (proveedor) {
        if (!asignacionExistente) {
          await asignarProveedor({
            producto_id: productoGuardado.producto_id,
            proveedor_id: proveedor.proveedor_id,
            producto_proveedor_precio: proveedor.precio_compra,
          });
        } else if (asignacionExistente.proveedor_id !== proveedor.proveedor_id) {
          await eliminarAsignacionProveedor(
            asignacionExistente.producto_proveedor_id,
          );
          await asignarProveedor({
            producto_id: productoGuardado.producto_id,
            proveedor_id: proveedor.proveedor_id,
            producto_proveedor_precio: proveedor.precio_compra,
          });
        } else if (
          asignacionExistente.producto_proveedor_precio !==
          proveedor.precio_compra
        ) {
          await actualizarPrecioCompra(
            asignacionExistente.producto_proveedor_id,
            proveedor.precio_compra,
          );
        }
      } else if (asignacionExistente) {
        await eliminarAsignacionProveedor(
          asignacionExistente.producto_proveedor_id,
        );
      }

      await cargar();
    },
    [cargar, inventarioPorProducto, proveedoresPorProducto],
  );

  const cambiarEstado = useCallback(
    async (producto_id: number, activo: boolean) => {
      await editarProducto(producto_id, {
        producto_estado: activo ? "activo" : "inactivo",
      });
      await cargar();
    },
    [cargar],
  );

  const productos: productoData[] = productosCompletos.map((producto) =>
    toRow(
      producto,
      inventarioPorProducto(producto.producto_id),
      proveedoresPorProducto(producto.producto_id),
    ),
  );

  return {
    productos,
    productosCompletos,
    loading,
    error,
    guardar,
    cambiarEstado,
    inventarioPorProducto,
    proveedoresPorProducto,
    recargar: cargar,
  };
}
