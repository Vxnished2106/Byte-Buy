export class ResponseVentaDto {
  venta_id: number;
  usuario_id: number;
  carrito_id: number | null;
  venta_fecha: Date;
  venta_monto: number;
  venta_estado: string;
}
