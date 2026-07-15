export class ResponseProveedorDto {

  proveedor_id: number;

  proveedor_nombre: string;

  proveedor_correo: string | null;

  proveedor_telefono: string | null;

  proveedor_direccion: string | null;

  proveedor_estado: string;

  cantidad_productos?: number;

}