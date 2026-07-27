export class ResponseFacturaDto {
  factura_id: number;

  venta_id: number;

  pago_id: number;

  factura_numero: string;

  /**
   * Total calculado a partir
   * de los detalles de compra.
   */
  factura_monto_total: number;

  factura_estado: string;

  factura_fecha_creada: Date;

  factura_fecha_enviada: Date | null;

  factura_enviada: boolean;
}