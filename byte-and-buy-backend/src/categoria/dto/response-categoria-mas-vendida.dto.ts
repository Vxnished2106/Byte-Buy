import { ResponseProductoMasVendidoDto } from '../../producto/dto/response-producto-mas-vendido.dto';

export class ResponseCategoriaMasVendidaDto {
  categoria_id: number;
  categoria_nombre: string;
  categoria_descripcion: string | null;
  categoria_imagen: string | null;
  total_vendido: number;
  productos: ResponseProductoMasVendidoDto[];
}
