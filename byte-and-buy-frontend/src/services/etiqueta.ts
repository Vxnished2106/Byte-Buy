import api from "./api";
import type { CreateEtiqueta, Etiqueta } from "../ts/interfaces";

/** Lista las etiquetas disponibles. */
export async function listarEtiquetas(): Promise<Etiqueta[]> {
  const { data } = await api.get<Etiqueta[]>("/etiquetas");
  return data;
}

/**
 * Registra una nueva etiqueta.
 * El backend no expone un endpoint de edición, solo listar y crear.
 */
export async function crearEtiqueta(
  datos: CreateEtiqueta,
): Promise<Etiqueta> {
  const { data } = await api.post<Etiqueta>("/etiquetas/registrar", datos);
  return data;
}
