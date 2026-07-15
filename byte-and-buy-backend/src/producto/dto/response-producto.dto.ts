import { Categoria } from '../../categoria/entities/categoria.entity';
import { Etiqueta } from '../../etiqueta/entities/etiqueta.entity';
import { ProductoEstado } from '../entities/producto.entity';

export class ResponseProductoDto {
  producto_id: number;

  producto_nombre: string;

  producto_estado: ProductoEstado;

  producto_descripcion: string | null;

  producto_precio: number;

  producto_impuesto: number;

  producto_descuento: number;

  producto_imagen: string | null;

  producto_banner: string | null;

  categorias: Categoria[];

  etiquetas: Etiqueta[];
}