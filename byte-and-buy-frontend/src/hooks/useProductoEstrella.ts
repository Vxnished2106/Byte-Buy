import { useEffect, useState } from "react";
import api from "../services/api";

/**
 * Métricas reales que usa el backend para calcular la puntuación
 * del producto estrella. Se exponen al frontend para que el usuario
 * entienda en qué se basa la recomendación destacada.
 */
export interface ProductoEstrellaMetricas {
  unidades_vendidas_ult_30dias: number;
  ingresos_totales: number;
  margen_ganancia_porcentual: number;
  rotacion_stock: number;
  tasa_conversion_estimada: number;
  descuento_aplicado: number;
}

/**
 * Respuesta del endpoint GET /productos/estrella.
 * Contiene el producto destacado, su puntuación y contexto
 * de cómo se calculó la selección.
 */
export interface ProductoEstrella {
  producto_id: number;
  producto_nombre: string;
  producto_precio: number;
  producto_descuento: number;
  producto_imagen: string | null;
  producto_descripcion: string | null;
  puntuacion_total: number;
  metricas: ProductoEstrellaMetricas;
  frecuencia_actualizacion: string;
  criterios: string[];
}

/**
 * Hook que consulta el "Producto Estrella" del catálogo.
 *
 * El producto se calcula en el backend usando una puntuación ponderada
 * con datos reales: ventas últimos 30 días, ingresos, margen, rotación
 * de stock, conversión estimada y atractivo por descuento.
 *
 * El resultado se cachea durante 5 minutos en el servidor, por lo que
 * esta llamada es muy rápida después de la primera vez.
 */
export function useProductoEstrella() {
  const [productoEstrella, setProductoEstrella] = useState<ProductoEstrella | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        const res = await api.get<ProductoEstrella>("/productos/estrella");
        if (!cancelado) {
          setProductoEstrella(res.data);
        }
      } catch (e: any) {
        if (!cancelado) {
          setError(e);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, []);

  return { productoEstrella, loading, error };
}

/**
 * Calcula el precio final del producto estrella aplicando su descuento
 * y redondeo monetario a 2 decimales (coherente con el cálculo del back).
 */
export function precioFinalProductoEstrella(e: ProductoEstrella): number {
  const bruto = e.producto_precio * (1 - e.producto_descuento / 100);
  return Math.round(bruto * 100) / 100;
}
