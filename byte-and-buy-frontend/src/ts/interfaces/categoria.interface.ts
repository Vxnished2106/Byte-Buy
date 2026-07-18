/** Forma que entrega el backend para una categoría de producto. */
export interface Categoria {
  categoria_id: number;
  categoria_nombre: string;
  categoria_descripcion?: string | null;
  categoria_imagen?: string | null;
}

/** El backend no expone edición de categorías, solo listar y crear. */
export interface CreateCategoria {
  categoria_nombre: string;
  categoria_descripcion?: string;
  categoria_imagen?: string;
}
