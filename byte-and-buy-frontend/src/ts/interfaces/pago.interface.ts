/** Pago registrado para una venta (`ResponsePagoDto` del backend). */
export interface Pago {
  pago_id: number;
  venta_id: number;
  metodo_pago_id: number;
  pago_monto: number;
  /** Llega como string ISO (JSON no tiene tipo `Date`). */
  pago_fecha: string;
  pago_estado: string;
  pago_detalle: Record<string, unknown> | null;
}

/** Datos para registrar un pago (`POST /pagos/registrar`). */
export interface CreatePago {
  venta_id: number;
  metodo_pago_id: number;
  pago_monto: number;
  pago_detalle?: Record<string, unknown>;
}

/** Datos editables de un pago (ej. cambiar `pago_estado`). */
export type UpdatePago = Partial<CreatePago> & { pago_estado?: string };

/** Marcas de tarjeta reconocidas por el backend al validar un pago. */
export type MarcaTarjeta = "visa" | "mastercard" | "amex";

/**
 * Datos de tarjeta a validar (`POST /pagos/validar`). Esta validación es
 * independiente del registro del pago: solo confirma que el número, CVV y
 * fecha de expiración de la tarjeta son válidos (algoritmo de Luhn, formato,
 * vigencia); no cobra ni crea ningún registro.
 */
export interface ValidarPago {
  metodo_pago: "tarjeta_credito" | "tarjeta_debito";
  numero_tarjeta: string;
  cvv: string;
  /** Formato MM/YY o MM/YYYY. */
  fecha_expiracion: string;
  nombre_titular: string;
}

/** Resultado de `POST /pagos/validar`. */
export interface ResultadoValidacionPago {
  valido: boolean;
  marca: MarcaTarjeta;
  mensaje: string;
}
