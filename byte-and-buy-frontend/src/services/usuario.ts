import api from "./api";
import type { Usuario, UpdateUsuario } from "../ts/interfaces";

export async function obtenerPerfil(): Promise<Usuario> {
  const { data } = await api.get<Usuario>("/usuarios/me");
  return data;
}

export async function actualizarPerfil(
  datos: UpdateUsuario,
  foto?: File,
): Promise<Usuario> {
  if (!foto) {
    const { data } = await api.patch<Usuario>("/usuarios", datos);
    return data;
  }

  const formData = new FormData();
  if (datos.usuario_nombre !== undefined)
    formData.append("usuario_nombre", datos.usuario_nombre);
  if (datos.usuario_apellido1 !== undefined)
    formData.append("usuario_apellido1", datos.usuario_apellido1);
  if (datos.usuario_apellido2)
    formData.append("usuario_apellido2", datos.usuario_apellido2);
  if (datos.usuario_correo !== undefined)
    formData.append("usuario_correo", datos.usuario_correo);
  formData.append("usuario_foto", foto);

  const { data } = await api.patch<Usuario>("/usuarios", formData, {
    headers: { "Content-Type": undefined },
  });
  return data;
}
