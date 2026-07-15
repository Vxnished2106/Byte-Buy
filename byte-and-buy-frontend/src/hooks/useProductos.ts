import { useCallback, useEffect, useState } from "react";
import { crearInventario, editarInventario, listarInventario } from "../services/inventario";
import { crearProducto, editarProducto, listarProductos } from "../services/producto";
import type {
  CreateProducto,
  Inventario,
  Producto,
  productoData,
  UpdateProducto,
} from "../ts/interfaces";

function toRow(producto: Producto, inventario?: Inventario): productoData {
  return {
    producto_id: producto.producto_id,
    producto_nombre: producto.producto_nombre,
    producto_descripcion: producto.producto_descripcion ?? "",
    producto_stock: inventario?.inventario_stock_actual ?? 0,
    producto_categoria:
      producto.categorias?.map((c) => c.categoria_nombre).join(", ") ||
      "Sin categoria",
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

  const guardar = useCallback(
    async (
      producto_id: number,
      datos: CreateProducto | UpdateProducto,
      stock: { stock_actual: number; stock_minimo: number },
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
      await cargar();
    },
    [cargar, inventarioPorProducto],
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
    toRow(producto, inventarioPorProducto(producto.producto_id)),
  );

  return {
    productos,
    productosCompletos,
    loading,
    error,
    guardar,
    cambiarEstado,
    inventarioPorProducto,
    recargar: cargar,
  };
}
