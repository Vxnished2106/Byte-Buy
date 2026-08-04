import { useEffect, useState } from "react";
import { Link } from "react-router";
import Header from "../components/Header";
import EditProfileModal, {
  type ProfileData,
} from "../components/EditProfileModal";
import { listarPedidos } from "../services/pedido";
import { actualizarPerfil, obtenerPerfil } from "../services/usuario";
import { obtenerIniciales, obtenerNombreCompleto } from "../utils/usuario";
import "../styles/perfil.css";

/**
 * Página de perfil del usuario autenticado. Carga los datos reales del usuario
 * desde el backend y permite editarlos mediante {@link EditProfileModal}.
 */
export default function Perfil() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [totalPedidos, setTotalPedidos] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    obtenerPerfil()
      .then((usuario) => {
        setUsuarioId(usuario.usuario_id);
        setProfile({
          nombre: usuario.usuario_nombre,
          apellido1: usuario.usuario_apellido1,
          apellido2: usuario.usuario_apellido2 ?? "",
          correo: usuario.usuario_correo,
          foto: usuario.usuario_foto ?? null,
        });
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el perfil",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // El total de pedidos se pide aparte (mismo `listarPedidos` que usa
  // PedidosLista) porque el perfil no necesita las filas, solo el conteo:
  // `limit: 1` evita traer pedidos que no se van a mostrar.
  useEffect(() => {
    if (!usuarioId) return;

    let vigente = true;
    listarPedidos({ cliente_id: usuarioId, limit: 1 })
      .then((resultado) => {
        if (vigente) setTotalPedidos(resultado.total);
      })
      .catch(() => {
        if (vigente) setTotalPedidos(null);
      });

    return () => {
      vigente = false;
    };
  }, [usuarioId]);

  const stats = [
    {
      id: 1,
      value: totalPedidos === null ? "—" : String(totalPedidos),
      label: "Pedidos realizados",
    },
  ];

  const nombreCompleto = profile
    ? obtenerNombreCompleto(profile.nombre, profile.apellido1, profile.apellido2)
    : "";

  const iniciales = profile
    ? obtenerIniciales(profile.nombre, profile.apellido1)
    : "";

  const handleSave = async (updated: ProfileData, foto?: File) => {
    if (!profile) return;
    setSaving(true);
    setSaveError("");
    try {
      const usuarioActualizado = await actualizarPerfil(
        {
          usuario_nombre: updated.nombre,
          usuario_apellido1: updated.apellido1,
          usuario_apellido2: updated.apellido2 || null,
          usuario_correo: updated.correo,
        },
        foto,
      );
      setProfile({
        nombre: usuarioActualizado.usuario_nombre,
        apellido1: usuarioActualizado.usuario_apellido1,
        apellido2: usuarioActualizado.usuario_apellido2 ?? "",
        correo: usuarioActualizado.usuario_correo,
        // Si no se subió una foto nueva, el backend puede no devolver la url
        // existente: se conserva la que ya estaba en pantalla en vez de
        // pisarla con lo que venga en la respuesta.
        foto: foto ? (usuarioActualizado.usuario_foto ?? null) : profile.foto,
      });
      setIsEditOpen(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "No se pudo actualizar el perfil",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="perfil-container">
          <p>Cargando perfil...</p>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Header />
        <div className="perfil-container">
          <p className="error-message">{error || "No se pudo cargar el perfil"}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="perfil-container">
        <div className="perfil-banner">
          <div className="banner-color"></div>
          <div className="banner-info">
            <div className="banner-info-left">
              <div className="perfil-bubble">
                {profile.foto ? (
                  <img src={profile.foto} alt="Foto de perfil" loading="lazy" />
                ) : (
                  <h2>{iniciales}</h2>
                )}
              </div>
              <div className="perfil-heading">
                <h3>{nombreCompleto}</h3>
                <span className="perfil-email">{profile.correo}</span>
              </div>
            </div>
            <button
              type="button"
              className="edit-profile-btn"
              onClick={() => setIsEditOpen(true)}
            >
              Editar perfil
            </button>
          </div>
        </div>

        <div className="perfil-stats">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.id}>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <section className="perfil-card">
          <div className="card-header">
            <h4>Pedidos</h4>
            <Link to="/byte&buy/pedidos" className="add-link">
              Ver todos
            </Link>
          </div>
          <p className="pedidos-cta-text">
            Revisa el historial completo de tus pedidos: estado, fecha,
            total y el detalle de cada uno.
          </p>
        </section>
      </div>

      {isEditOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => {
            setIsEditOpen(false);
            setSaveError("");
          }}
          onSave={handleSave}
          saving={saving}
          error={saveError}
        />
      )}
    </>
  );
}
