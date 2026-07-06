import type { Usuario } from "./usuario.interface";

export interface RegisterData {
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterResult {
  usuario: Usuario | null;
  requiereConfirmacion: boolean;
}
