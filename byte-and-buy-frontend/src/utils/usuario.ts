export function obtenerIniciales(nombre: string, apellido1: string): string {
  return [nombre, apellido1]
    .filter(Boolean)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase();
}

export function obtenerNombreCompleto(
  nombre: string,
  apellido1: string,
  apellido2?: string | null,
): string {
  return [nombre, apellido1, apellido2].filter(Boolean).join(" ");
}
