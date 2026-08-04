import api from "./api";
import { errorDelBackend } from "./errores";
import type { CreateDireccionEnvio, DireccionEnvio } from "../ts/interfaces";

/** Lista las direcciones de envío del usuario autenticado. */
export async function listarMisDirecciones(): Promise<DireccionEnvio[]> {
  try {
    const { data } = await api.get<DireccionEnvio[]>("/direcciones-envio");
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar tus direcciones");
  }
}

/** Crea una nueva dirección de envío para el usuario autenticado. */
export async function crearDireccion(
  datos: CreateDireccionEnvio,
): Promise<DireccionEnvio> {
  try {
    const { data } = await api.post<DireccionEnvio>("/direcciones-envio", datos);
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudo guardar la dirección");
  }
}
