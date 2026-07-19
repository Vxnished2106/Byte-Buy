export class ResponsePagoDto {
  pago_id: number;
  venta_id: number;
  metodo_pago_id: number;
  pago_monto: number;
  pago_fecha: Date;
  pago_estado: string;
  pago_detalle: any | null;
}
