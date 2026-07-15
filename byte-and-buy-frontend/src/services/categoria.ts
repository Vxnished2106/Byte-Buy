import api from "./api";
import type { Categoria, CreateCategoria } from "../ts/interfaces";

/** Lista las categorías disponibles. */
export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
}

/**
 * Registra una nueva categoría (multipart/form-data por la imagen).
 * El backend no expone un endpoint de edición, solo listar y crear.
 */
export async function crearCategoria(
  datos: CreateCategoria,
  imagen?: File,
): Promise<Categoria> {
  const formData = new FormData();
  formData.append("categoria_nombre", datos.categoria_nombre);
  if (datos.categoria_descripcion)
    formData.append("categoria_descripcion", datos.categoria_descripcion);
  if (imagen) formData.append("categoria_imagen", imagen);

  const { data } = await api.post<Categoria>(
    "/categorias/registrar",
    formData,
    { headers: { "Content-Type": undefined } },
  );
  return data;
}
