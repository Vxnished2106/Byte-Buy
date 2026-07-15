export class ResponseCatalogoProductoDto {
  producto_id: number;

  producto_nombre: string;

  producto_precio: number;

  producto_imagen: string | null;

  disponible: boolean;
}