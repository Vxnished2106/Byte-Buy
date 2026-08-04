import api from "./api";
import { errorDelBackend } from "./errores";
import type { Ciudad, Pais, Region } from "../ts/interfaces";

/** Lista todos los países disponibles. */
export async function listarPaises(): Promise<Pais[]> {
  try {
    const { data } = await api.get<Pais[]>("/catalogos/paises");
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar los países");
  }
}

/** Lista las regiones, opcionalmente filtradas por país. */
export async function listarRegiones(pais_id?: number): Promise<Region[]> {
  try {
    const { data } = await api.get<Region[]>("/catalogos/regiones", {
      params: pais_id ? { pais_id } : undefined,
    });
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar las regiones");
  }
}

/** Lista las ciudades, opcionalmente filtradas por región. */
export async function listarCiudades(region_id?: number): Promise<Ciudad[]> {
  try {
    const { data } = await api.get<Ciudad[]>("/catalogos/ciudades", {
      params: region_id ? { region_id } : undefined,
    });
    return data;
  } catch (error) {
    throw errorDelBackend(error, "No se pudieron cargar las ciudades");
  }
}
