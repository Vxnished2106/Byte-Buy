/** Catálogos geográficos usados por las direcciones de envío (`GET /catalogos/*`). */

/** Forma que entrega el backend para un país (`ResponsePaisDto`). */
export interface Pais {
  pais_id: number;
  pais_nombre: string;
  pais_codigo: string | null;
}

/** Forma que entrega el backend para una región (`ResponseRegionDto`). */
export interface Region {
  region_id: number;
  region_nombre: string;
  pais_id: number;
}

/** Forma que entrega el backend para una ciudad (`ResponseCiudadDto`). */
export interface Ciudad {
  ciudad_id: number;
  ciudad_nombre: string;
  region_id: number;
}
