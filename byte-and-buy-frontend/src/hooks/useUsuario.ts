import { useEffect, useState } from "react";
import { obtenerPerfil } from "../services/usuario";
import type { Usuario } from "../ts/interfaces";
import { useSesion } from "./useSesion";

/**
 * Expone el perfil (`Usuario`) del backend correspondiente a la sesión
 * activa. Se apoya en `useSesion` y vuelve a pedir el perfil cada vez que
 * cambia la sesión; si no hay sesión, `usuario` queda en `null`.
 */
export function useUsuario() {
  const { session, loading: cargandoSesion } = useSesion();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vigente = true;

    // Espera a que useSesion resuelva antes de decidir si hay o no usuario.
    if (cargandoSesion) return;

    if (!session) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    obtenerPerfil()
      .then((perfil) => {
        if (vigente) setUsuario(perfil);
      })
      .catch(() => {
        if (vigente) setUsuario(null);
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    return () => {
      vigente = false;
    };
  }, [session, cargandoSesion]);

  return { usuario, loading: cargandoSesion || loading };
}
