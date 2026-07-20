/** Obtiene las iniciales (nombre + primer apellido) para el avatar del usuario. */
export function obtenerIniciales(nombre: string, apellido1: string): string {
  return [nombre, apellido1]
    .filter(Boolean)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase();
}

/** Concatena nombre y apellidos (el segundo apellido es opcional) en un solo string. */
export function obtenerNombreCompleto(
  nombre: string,
  apellido1: string,
  apellido2?: string | null,
): string {
  return [nombre, apellido1, apellido2].filter(Boolean).join(" ");
}
