/**
 * DTO de respuesta para un proveedor.
 */
export class ResponseProveedorDto {

  /** ID único del proveedor. */
  proveedor_id: number;

  /** Nombre del proveedor. */
  proveedor_nombre: string;

  /** Correo del proveedor (opcional). */
  proveedor_correo: string | null;

  /** Teléfono del proveedor (opcional). */
  proveedor_telefono: string | null;

  /** Dirección del proveedor (opcional). */
  proveedor_direccion: string | null;

  /** Estado del proveedor (activo/inactivo). */
  proveedor_estado: string;

  /** Cantidad de productos asociados al proveedor (opcional). */
  cantidad_productos?: number;

}
