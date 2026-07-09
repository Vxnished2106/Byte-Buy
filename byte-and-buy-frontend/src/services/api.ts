import axios from "axios";
import { supabase } from "./supabaseClient";

/**
 * Cliente Axios central para todas las llamadas al backend.
 * Usar esta instancia (en vez de axios directamente) para que
 * la autenticación y el manejo de sesión expirada se apliquen
 * automáticamente en toda la app.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Adjunta el access token de Supabase a cada request saliente.
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Si el backend responde 401, la sesión ya no es válida en Supabase:
// se cierra sesión localmente para forzar el redirect al login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
    }
    return Promise.reject(error);
  },
);

export default api;
