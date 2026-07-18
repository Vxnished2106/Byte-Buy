/** Forma que entrega el backend para una etiqueta de producto. */
export interface Etiqueta {
  etiqueta_id: number;
  etiqueta_nombre: string;
}

/** El backend no expone edición de etiquetas, solo listar y crear. */
export interface CreateEtiqueta {
  etiqueta_nombre: string;
}
