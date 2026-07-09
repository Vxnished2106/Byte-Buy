import { supabase } from "./supabaseClient";
import { obtenerPerfil } from "./usuario";
import type { RegisterData, RegisterResult } from "../ts/interfaces";

/**
 * Registra un nuevo usuario en Supabase Auth.
 * Si el proyecto tiene confirmación de correo activada, Supabase no
 * devuelve sesión: en ese caso se retorna `requiereConfirmacion: true`
 * y aún no hay perfil que consultar en el backend.
 */
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

/** Inicia sesión con email y contraseña y devuelve el perfil del usuario autenticado. */
export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return obtenerPerfil();
}

/** Cierra la sesión actual en Supabase. */
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

/** Devuelve la sesión activa de Supabase, o `null` si no hay ninguna. */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
