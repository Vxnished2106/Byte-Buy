/** Método de pago disponible (tabla administrable `metodo_pago` del backend). */
export interface MetodoPago {
  metodo_pago_id: number;
  metodo_pago_nombre: string;
}

/** Datos para crear un método de pago. */
export interface CreateMetodoPago {
  metodo_pago_nombre: string;
}

/** Datos editables de un método de pago. */
export type UpdateMetodoPago = Partial<CreateMetodoPago>;
