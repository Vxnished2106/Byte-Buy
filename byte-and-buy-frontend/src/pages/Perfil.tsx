import { useState } from "react";
import Header from "../components/Header";
import EditProfileModal, {
  type ProfileData,
} from "../components/EditProfileModal";
import "../styles/perfil.css";

const stats = [{ id: 1, value: "24", label: "Pedidos realizados" }];

const direcciones = [
  {
    id: 1,
    nombre: "Casa",
    predeterminada: true,
    calle: "Av. Reforma 1234, Piso 8",
    ciudad: "Ciudad de México, 06600",
    pais: "México",
  },
  {
    id: 2,
    nombre: "Oficina",
    predeterminada: false,
    calle: "Torre Insurgentes 500, Of. 12",
    ciudad: "Ciudad de México, 03810",
    pais: "México",
  },
];

const tarjeta = {
  marca: "VISA",
  expiracion: "09/27",
  ultimosDigitos: "4242",
};

const pedidos = [
  {
    id: "BB-2026-4839",
    nombre: "Portátil Vela 14",
    fecha: "28 jun 2026",
    estado: "Entregado",
    total: "$1,299",
  },
  {
    id: "BB-2026-4801",
    nombre: "Auriculares Aura Pro",
    fecha: "15 jun 2026",
    estado: "En camino",
    total: "$249",
  },
  {
    id: "BB-2026-4772",
    nombre: "Smartwatch Tempo 3",
    fecha: "2 jun 2026",
    estado: "Entregado",
    total: "$199",
  },
];

function estadoClassName(estado: string) {
  return estado === "Entregado" ? "entregado" : "en-camino";
}

export default function Perfil() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    nombre: "Alex",
    apellido1: "Morales",
    apellido2: "",
    correo: "alex.morales@correo.com",
  });

  const nombreCompleto = [profile.nombre, profile.apellido1, profile.apellido2]
    .filter(Boolean)
    .join(" ");

  const iniciales = [profile.nombre, profile.apellido1]
    .filter(Boolean)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase();

  const handleSave = (updated: ProfileData) => {
    setProfile(updated);
    setIsEditOpen(false);
  };

  return (
    <>
      <Header />
      <div className="perfil-container">
        <div className="perfil-banner">
          <div className="banner-color"></div>
          <div className="banner-info">
            <div className="banner-info-left">
              <div className="perfil-bubble">
                <h2>{iniciales}</h2>
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
            <h4>Pedidos recientes</h4>
            <button type="button" className="add-link">
              Ver todos
            </button>
          </div>
          <div className="pedidos-list">
            {pedidos.map((pedido) => (
              <div className="pedido-item" key={pedido.id}>
                <div className="pedido-thumb"></div>
                <div className="pedido-info">
                  <span className="pedido-nombre">{pedido.nombre}</span>
                  <span className="pedido-meta">
                    {pedido.id} · {pedido.fecha}
                  </span>
                </div>
                <span
                  className={`pedido-status ${estadoClassName(pedido.estado)}`}
                >
                  {pedido.estado}
                </span>
                <span className="pedido-precio">{pedido.total}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {isEditOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
