import { ProductoProveedorEstado } from "../entities/producto_proveedor.entity";

export class ResponseProductoProveedorDto {

  producto_proveedor_id: number;

  producto_proveedor_codigo: string | null;

  producto_proveedor_precio: number;

  producto_proveedor_estado: ProductoProveedorEstado;

  producto_id: number;

  proveedor_id: number;


  proveedor?: {
    proveedor_id: number;
    proveedor_nombre: string;
    proveedor_direccion: string | null;
    proveedor_telefono: string | null;
  };

}