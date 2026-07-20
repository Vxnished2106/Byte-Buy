/** Resultado de una regla individual de validación de contraseña. */
export interface ValidacionContrasena {
  text: string;
  completed: boolean;
}

/**
 * Evalúa una contraseña contra las reglas de seguridad requeridas
 * (longitud mínima, mayúsculas, números y caracteres especiales).
 * @param password Contraseña a evaluar.
 * @returns Lista de reglas con su estado de cumplimiento.
 */
export function validarContrasena(password: string): ValidacionContrasena[] {
  return [
    { text: "Minimo 8 caracteres", completed: password.length >= 8 },
    { text: "Uso de mayusculas", completed: /[A-Z]/.test(password) },
    { text: "Uso de numeros", completed: /[0-9]/.test(password) },
    {
      text: "Uso de caracteres especiales",
      completed: /[!@#$%^&*()?:{}|<>]/.test(password),
    },
  ];
}

/** Tamaño máximo permitido para una imagen subida (5MB). */
const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

/**
 * Valida que un archivo sea una imagen y no supere el tamaño máximo permitido.
 * @param file Archivo a validar.
 * @returns Mensaje de error, o `null` si el archivo es válido.
 */
export function validarImagen(file: File): string | null {
  if (!file.type.startsWith("image/")) return "El archivo debe ser una imagen";
  if (file.size > TAMANO_MAXIMO_IMAGEN) return "La imagen no debe superar los 5MB";
  return null;
}
