export interface ValidacionContrasena {
  text: string;
  completed: boolean;
}

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

const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

export function validarImagen(file: File): string | null {
  if (!file.type.startsWith("image/")) return "El archivo debe ser una imagen";
  if (file.size > TAMANO_MAXIMO_IMAGEN) return "La imagen no debe superar los 5MB";
  return null;
}
