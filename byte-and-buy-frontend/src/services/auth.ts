import { supabase } from "./supabaseClient";
import { obtenerPerfil } from "./usuario";
import type { RegisterData, RegisterResult } from "../ts/interfaces";

export async function register(datos: RegisterData): Promise<RegisterResult> {
  const { data, error } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: {
      data: {
        nombre: datos.nombre,
        apellido1: datos.apellido1,
        apellido2: datos.apellido2 ?? null,
      },
    },
  });

  if (error) throw new Error(error.message);

  if (!data.session) {
    return { usuario: null, requiereConfirmacion: true };
  }

  const usuario = await obtenerPerfil();
  return { usuario, requiereConfirmacion: false };
}

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return obtenerPerfil();
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
