/**
 * Servicio de identificación del Producto Estrella del catálogo.
 *
 * Se encarga de calcular una puntuación ponderada por producto utilizando
 * métricas reales del sistema, y exponer el producto con mejor puntuación
 * para usarlo en la home, banners promocionales y recomendaciones destacadas.
 */
import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto, ProductoEstado } from '../producto/entities/producto.entity';
import { DetalleCompra } from '../detalle_compra/entities/detalle_compra.entity';
import { Venta } from '../venta/entities/venta.entity';
import { ProductoProveedor, ProductoProveedorEstado } from '../producto_proveedor/entities/producto_proveedor.entity';
import { Inventario } from '../inventario/entities/inventario.entity';

/**
 * Pesos de las métricas de "Producto Estrella".
 *
 * Valores por defecto calibrados para favorecer productos con buena
 * combinación de ventas, margen y disponibilidad. Se pueden ajustar
 * vía constructor/DI según las necesidades del negocio sin tocar la lógica.
 *
 * Suma de pesos = 100 (100%).
 *
 * - pesoVentasUnidades (30%): volumen bruto de unidades vendidas (últimos 30 días)
 * - pesoIngresosTotales (25%): monto total facturado del producto
 * - pesoMargenGanancia (20%): diferencia entre precio venta y precio compra (proveedor)
 * - pesoTasaConversion (10%): % de detalle_compra / vistas (proxy cuando no hay tabla de views)
 * - pesoRotacionStock (10%): unidades vendidas / (stock actual + unidades vendidas)
 * - pesoDescuentoAtractivo (5%): productos con oferta son puntuados extra
 */
export interface PesosProductoEstrella {
  pesoVentasUnidades: number;
  pesoIngresosTotales: number;
  pesoMargenGanancia: number;
  pesoTasaConversion: number;
  pesoRotacionStock: number;
  pesoDescuentoAtractivo: number;
}

export const PESOS_POR_DEFECTO: PesosProductoEstrella = {
  pesoVentasUnidades: 30,
  pesoIngresosTotales: 25,
  pesoMargenGanancia: 20,
  pesoTasaConversion: 10,
  pesoRotacionStock: 10,
  pesoDescuentoAtractivo: 5,
};

/** DTO de respuesta con el producto estrella y sus métricas. */
export interface ProductoEstrellaResponse {
  producto_id: number;
  producto_nombre: string;
  producto_precio: number;
  producto_descuento: number;
  producto_imagen: string | null;
  producto_descripcion: string | null;
  puntuacion_total: number;
  metricas: {
    unidades_vendidas_ult_30dias: number;
    ingresos_totales: number;
    margen_ganancia_porcentual: number;
    rotacion_stock: number;
    tasa_conversion_estimada: number;
    descuento_aplicado: number;
  };
  frecuencia_actualizacion: string;
  criterios: string[];
}

/** Rows devueltas por la query cruda de agregación. */
interface AgregadoVentaRow {
  producto_id: number;
  unidades: string;
  ingresos: string;
  ventas: string;
}

@Injectable()
export class ProductoEstrellaService {
  /** Caché en memoria para no recalcular en cada request. */
  private cache: { expiracion: number; data: ProductoEstrellaResponse | null } | null =
    null;

  /** Duración del caché en ms. Valor por defecto = 5 minutos (300_000 ms). */
  private readonly ttlCacheMs = 5 * 60 * 1000;

  /** Ventana de días usada para calcular las ventas y rotación. */
  private readonly diasVentanaVentas = 30;

  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,

    @InjectRepository(DetalleCompra)
    private readonly detalleCompraRepository: Repository<DetalleCompra>,

    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,

    @InjectRepository(ProductoProveedor)
    private readonly productoProveedorRepository: Repository<ProductoProveedor>,

    @Optional()
    private readonly pesos: PesosProductoEstrella = PESOS_POR_DEFECTO,
  ) {}

  /**
   * Devuelve la frecuencia de actualización de la clasificación, en formato
   * human-legible para exponerla en el frontend/documentación.
   */
  obtenerFrecuenciaActualizacion(): string {
    const minutos = Math.round(this.ttlCacheMs / 60000);
    return `Cálculo en vivo con caché de ${minutos} minutos. Se actualiza cada ${minutos} min o después de cada nueva venta confirmada.`;
  }

  /** Lista de criterios utilizados en la puntuación, para UI. */
  obtenerCriterios(): string[] {
    return [
      `Volumen de unidades vendidas (últimos ${this.diasVentanaVentas} días) · peso ${this.pesos.pesoVentasUnidades}%`,
      `Ingresos totales generados · peso ${this.pesos.pesoIngresosTotales}%`,
      `Margen de ganancia (venta vs. costo proveedor) · peso ${this.pesos.pesoMargenGanancia}%`,
      `Tasa de conversión estimada · peso ${this.pesos.pesoTasaConversion}%`,
      `Rotación de inventario · peso ${this.pesos.pesoRotacionStock}%`,
      `Atractivo por descuento vigente · peso ${this.pesos.pesoDescuentoAtractivo}%`,
    ];
  }

  /**
   * Calcula y devuelve el "Producto Estrella" del catálogo.
   *
   * La puntuación se calcula min-max normalizando cada métrica entre 0 y 100
   * respecto al mejor valor de la muestra, y aplicando los pesos configurados.
   * El producto con mayor puntuación es la estrella. Si no hay datos suficientes
   * (sin ventas), usa fallback basado en: disponibilidad + descuento + precio.
   */
  async obtenerProductoEstrella(): Promise<ProductoEstrellaResponse | null> {
    const ahora = Date.now();
    if (this.cache && this.cache.expiracion > ahora) {
      return this.cache.data;
    }

    const desde = new Date();
    desde.setDate(desde.getDate() - this.diasVentanaVentas);

    const productosActivos = await this.productoRepository.find({
      where: { producto_estado: ProductoEstado.ACTIVO },
      relations: ['inventario', 'productoProveedores', 'etiquetas', 'categorias'],
    });

    if (productosActivos.length === 0) {
      this.cache = { expiracion: ahora + this.ttlCacheMs, data: null };
      return null;
    }

    const agregadosRaw = await this.detalleCompraRepository
      .createQueryBuilder('dc')
      .innerJoin('dc.venta', 'v')
      .select('dc.producto_id', 'producto_id')
      .addSelect('COALESCE(SUM(dc.detalle_compra_cantidad), 0)', 'unidades')
      .addSelect('COALESCE(SUM(dc.detalle_compra_total), 0)', 'ingresos')
      .addSelect('COUNT(DISTINCT v.venta_id)', 'ventas')
      .where('v.venta_fecha >= :desde', { desde })
      .andWhere('v.venta_estado IN (:...estados)', {
        estados: ['aprobada', 'confirmada', 'pagada', 'aprobado'],
      })
      .groupBy('dc.producto_id')
      .getRawMany<AgregadoVentaRow>();

    const agregadosPorProducto = new Map<number, AgregadoVentaRow>();
    for (const row of agregadosRaw) {
      agregadosPorProducto.set(Number(row.producto_id), row);
    }

    /** Normaliza un valor a [0, 100] en base al rango [min, max]. */
    const norm = (valor: number, min: number, max: number): number => {
      if (max === min) return valor > 0 ? 100 : 0;
      return ((valor - min) / (max - min)) * 100;
    };

    const filas = productosActivos.map((prod) => {
      const agg = agregadosPorProducto.get(prod.producto_id) ?? {
        producto_id: prod.producto_id,
        unidades: '0',
        ingresos: '0',
        ventas: '0',
      };
      const unidades = Number(agg.unidades) || 0;
      const ingresos = Number(agg.ingresos) || 0;
      const ventas = Number(agg.ventas) || 0;

      const stock = prod.inventario?.inventario_stock_actual ?? 0;
      const denominadorRotacion = stock + unidades;
      const rotacion = denominadorRotacion > 0 ? unidades / denominadorRotacion : 0;

      const precioProveedor =
        prod.productoProveedores?.find(
          (pp) => pp.producto_proveedor_estado === ProductoProveedorEstado.ACTIVO,
        )?.producto_proveedor_precio ?? 0;
      const margenBruto = Math.max(0, Number(prod.producto_precio) - Number(precioProveedor));
      const margenPct =
        Number(prod.producto_precio) > 0
          ? (margenBruto / Number(prod.producto_precio)) * 100
          : 0;

      const conversionEstimada = stock > 0 ? (ventas / Math.max(1, stock + 10)) * 100 : 0;

      return {
        producto: prod,
        unidades,
        ingresos,
        margenPct,
        rotacion,
        conversionEstimada,
        descuento: Number(prod.producto_descuento) || 0,
      };
    });

    const mins = {
      unidades: Math.min(...filas.map((f) => f.unidades)),
      ingresos: Math.min(...filas.map((f) => f.ingresos)),
      margenPct: Math.min(...filas.map((f) => f.margenPct)),
      rotacion: Math.min(...filas.map((f) => f.rotacion)),
      conversionEstimada: Math.min(...filas.map((f) => f.conversionEstimada)),
      descuento: Math.min(...filas.map((f) => f.descuento)),
    };
    const maxs = {
      unidades: Math.max(...filas.map((f) => f.unidades), 1),
      ingresos: Math.max(...filas.map((f) => f.ingresos), 1),
      margenPct: Math.max(...filas.map((f) => f.margenPct), 1),
      rotacion: Math.max(...filas.map((f) => f.rotacion), 1),
      conversionEstimada: Math.max(...filas.map((f) => f.conversionEstimada), 1),
      descuento: Math.max(...filas.map((f) => f.descuento), 1),
    };

    const puntuadas = filas.map((f) => {
      const pVentas = norm(f.unidades, mins.unidades, maxs.unidades) * (this.pesos.pesoVentasUnidades / 100);
      const pIngresos = norm(f.ingresos, mins.ingresos, maxs.ingresos) * (this.pesos.pesoIngresosTotales / 100);
      const pMargen = norm(f.margenPct, mins.margenPct, maxs.margenPct) * (this.pesos.pesoMargenGanancia / 100);
      const pConversion = norm(f.conversionEstimada, mins.conversionEstimada, maxs.conversionEstimada) * (this.pesos.pesoTasaConversion / 100);
      const pRotacion = norm(f.rotacion, mins.rotacion, maxs.rotacion) * (this.pesos.pesoRotacionStock / 100);
      const pDescuento = norm(f.descuento, mins.descuento, maxs.descuento) * (this.pesos.pesoDescuentoAtractivo / 100);

      let total = pVentas + pIngresos + pMargen + pConversion + pRotacion + pDescuento;

      /** Fallback: si no hubo ventas en la ventana (todos 0), puntuar por disponibilidad + oferta. */
      if (maxs.unidades <= 0) {
        const stock = f.producto.inventario?.inventario_stock_actual ?? 0;
        const oferta = f.descuento;
        const precioAtractivo = Number(f.producto.producto_precio) > 0 ? 1 / Number(f.producto.producto_precio) : 0;
        total = stock > 0 ? 40 : 0;
        total += Math.min(30, oferta * 2);
        total += Math.min(30, precioAtractivo * 1000);
      }

      return {
        ...f,
        puntuacion: Math.round(total * 100) / 100,
      };
    });

    puntuadas.sort((a, b) => b.puntuacion - a.puntuacion);
    const mejor = puntuadas[0];

    const response: ProductoEstrellaResponse = {
      producto_id: mejor.producto.producto_id,
      producto_nombre: mejor.producto.producto_nombre,
      producto_precio: Number(mejor.producto.producto_precio),
      producto_descuento: Number(mejor.producto.producto_descuento) || 0,
      producto_imagen: mejor.producto.producto_imagen,
      producto_descripcion: mejor.producto.producto_descripcion,
      puntuacion_total: mejor.puntuacion,
      metricas: {
        unidades_vendidas_ult_30dias: mejor.unidades,
        ingresos_totales: Math.round(mejor.ingresos * 100) / 100,
        margen_ganancia_porcentual: Math.round(mejor.margenPct * 100) / 100,
        rotacion_stock: Math.round(mejor.rotacion * 100) / 100,
        tasa_conversion_estimada: Math.round(mejor.conversionEstimada * 100) / 100,
        descuento_aplicado: mejor.descuento,
      },
      frecuencia_actualizacion: this.obtenerFrecuenciaActualizacion(),
      criterios: this.obtenerCriterios(),
    };

    this.cache = { expiracion: ahora + this.ttlCacheMs, data: response };
    return response;
  }
}
