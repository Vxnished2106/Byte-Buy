import api from "./api";
import type { Usuario, UpdateUsuario } from "../ts/interfaces";

export async function obtenerPerfil(): Promise<Usuario> {
  const { data } = await api.get<Usuario>("/usuarios/me");
  return data;
}

export async function actualizarPerfil(datos: UpdateUsuario): Promise<Usuario> {
  const { data } = await api.patch<Usuario>("/usuarios", datos);
  return data;
}
