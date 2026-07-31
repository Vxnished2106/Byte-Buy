import type { PedidoEstado } from "./interfaces";

/**
 * Reglas de pedido replicadas en el cliente SOLO para UX (validación inmediata
 * y previsualización de totales).
 *
 * ⚠️ FUENTE DE VERDAD: el backend. El servidor revalida todo y recalcula los
 * importes; nunca se confía en lo que calcula aquí el navegador. Este módulo
 * existe para dar feedback rápido, no para decidir nada definitivo.
 */

/** Etiqueta legible de cada estado. */
export const ETIQUETA_ESTADO: Record<PedidoEstado, string> = {
  BORRADOR: "Borrador",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Transiciones permitidas (espejo de `TRANSICIONES_PEDIDO` del backend). */
export const TRANSICIONES: Record<PedidoEstado, PedidoEstado[]> = {
  BORRADOR: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

/** Estados a los que se puede transicionar desde `estado`. */
export function transicionesDesde(estado: PedidoEstado): PedidoEstado[] {
  return TRANSICIONES[estado] ?? [];
}

/** Redondeo monetario a 2 decimales (mismo criterio que el backend). */
export function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/** Importes calculados de una línea (previsualización). */
export interface ImportesLinea {
  subtotal: number;
  descuento_monto: number;
  impuesto_monto: number;
  total: number;
}

/**
 * Calcula los importes de una línea para mostrarlos en vivo.
 * Es una PREVISUALIZACIÓN: el total real lo devuelve el servidor.
 */
export function calcularLinea(
  precioUnitario: number,
  cantidad: number,
  descuentoPct: number,
  impuestoPct: number,
): ImportesLinea {
  const subtotal = redondear(precioUnitario * cantidad);
  const descuento_monto = redondear((subtotal * descuentoPct) / 100);
  const base = subtotal - descuento_monto;
  const impuesto_monto = redondear((base * impuestoPct) / 100);
  const total = redondear(base + impuesto_monto);
  return { subtotal, descuento_monto, impuesto_monto, total };
}

/** Suma los importes de varias líneas (previsualización de los totales del pedido). */
export function sumarTotales(lineas: ImportesLinea[]) {
  return lineas.reduce(
    (acc, l) => ({
      subtotal: redondear(acc.subtotal + l.subtotal),
      descuento_total: redondear(acc.descuento_total + l.descuento_monto),
      impuesto_total: redondear(acc.impuesto_total + l.impuesto_monto),
      total: redondear(acc.total + l.total),
    }),
    { subtotal: 0, descuento_total: 0, impuesto_total: 0, total: 0 },
  );
}

/** Formatea un número como monto (sin asumir moneda; el backend usa una sola). */
export function formatearMonto(valor: number): string {
  return `$${Number(valor).toFixed(2)}`;
}

/** Errores de una línea, por campo (para `aria-invalid` y mensajes ligados). */
export interface ErroresLinea {
  producto_id?: string;
  cantidad?: string;
  precio_unitario?: string;
  descuento_pct?: string;
}

/** Valores de una línea en el formulario. */
export interface LineaFormValues {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento_pct: number;
}

/** Valida la forma de una línea (mismas reglas de forma que el DTO del backend). */
export function validarLinea(linea: LineaFormValues): ErroresLinea {
  const errores: ErroresLinea = {};
  if (!linea.producto_id) {
    errores.producto_id = "Selecciona un producto.";
  }
  if (!Number.isInteger(linea.cantidad) || linea.cantidad < 1) {
    errores.cantidad = "La cantidad debe ser un entero mayor o igual a 1.";
  }
  if (linea.precio_unitario < 0) {
    errores.precio_unitario = "El precio no puede ser negativo.";
  }
  if (linea.descuento_pct < 0 || linea.descuento_pct > 100) {
    errores.descuento_pct = "El descuento debe estar entre 0 y 100.";
  }
  return errores;
}

/** ¿Tiene la línea algún error? */
export function lineaTieneErrores(errores: ErroresLinea): boolean {
  return Object.keys(errores).length > 0;
}
