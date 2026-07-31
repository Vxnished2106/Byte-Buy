/**
 * DTO de respuesta para un país del catálogo.
 */
export class ResponsePaisDto {
  /** ID único del país. */
  pais_id: number;

  /** Nombre del país. */
  pais_nombre: string;

  /** Código ISO del país (opcional). */
  pais_codigo: string | null;
}

/**
 * DTO de respuesta para una región del catálogo.
 */
export class ResponseRegionDto {
  /** ID único de la región. */
  region_id: number;

  /** Nombre de la región. */
  region_nombre: string;

  /** ID del país al que pertenece la región. */
  pais_id: number;
}

/**
 * DTO de respuesta para una ciudad del catálogo.
 */
export class ResponseCiudadDto {
  /** ID único de la ciudad. */
  ciudad_id: number;

  /** Nombre de la ciudad. */
  ciudad_nombre: string;

  /** ID de la región a la que pertenece la ciudad. */
  region_id: number;
}
