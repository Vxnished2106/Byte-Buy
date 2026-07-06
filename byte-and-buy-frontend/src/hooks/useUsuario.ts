import { useEffect, useState } from "react";
import { obtenerPerfil } from "../services/usuario";
import type { Usuario } from "../ts/interfaces";
import { useSesion } from "./useSesion";

export function useUsuario() {
  const { session, loading: cargandoSesion } = useSesion();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vigente = true;

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
