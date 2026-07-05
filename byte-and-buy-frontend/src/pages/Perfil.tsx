import { useState } from "react";
import Header from "../components/Header";
import EditProfileModal, {
  type ProfileData,
} from "../components/EditProfileModal";
import "../styles/perfil.css";

const stats = [
  { id: 1, value: "24", label: "Pedidos realizados" },
  { id: 2, value: "$4,860", label: "Total gastado" },
];

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

function formatFechaNacimiento(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function estadoClassName(estado: string) {
  return estado === "Entregado" ? "entregado" : "en-camino";
}

export default function Perfil() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    nombre: "Alex Morales",
    correo: "alex.morales@correo.com",
    telefono: "+1 555 218 4409",
    fechaNacimiento: "1992-03-14",
  });

  const iniciales = profile.nombre
    .split(" ")
    .map((palabra) => palabra[0])
    .join("")
    .slice(0, 2)
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
                <h3>{profile.nombre}</h3>
                <span className="perfil-email">
                  {profile.correo}
                </span>
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
          <h4>Datos personales</h4>
          <div className="datos-grid">
            <div className="dato">
              <span className="dato-label">Nombre completo</span>
              <span className="dato-value">{profile.nombre}</span>
            </div>
            <div className="dato">
              <span className="dato-label">Correo electrónico</span>
              <span className="dato-value">{profile.correo}</span>
            </div>
            <div className="dato">
              <span className="dato-label">Teléfono</span>
              <span className="dato-value">{profile.telefono}</span>
            </div>
            <div className="dato">
              <span className="dato-label">Fecha de nacimiento</span>
              <span className="dato-value">
                {formatFechaNacimiento(profile.fechaNacimiento)}
              </span>
            </div>
          </div>
        </section>

        <div className="perfil-row">
          <section className="perfil-card direcciones-card">
            <div className="card-header">
              <h4>Direcciones</h4>
              <button type="button" className="add-link">
                + Añadir
              </button>
            </div>
            <div className="direcciones-list">
              {direcciones.map((direccion) => (
                <div
                  className={`direccion-box${direccion.predeterminada ? " default" : ""}`}
                  key={direccion.id}
                >
                  <div className="direccion-title">
                    {direccion.nombre}
                    {direccion.predeterminada && (
                      <span className="badge-default">Predeterminada</span>
                    )}
                  </div>
                  <address>
                    {direccion.calle}
                    <br />
                    {direccion.ciudad}
                    <br />
                    {direccion.pais}
                  </address>
                </div>
              ))}
            </div>
          </section>

          <section className="perfil-card metodo-pago-card">
            <h4>Método de pago</h4>
            <div className="tarjeta-box">
              <div className="tarjeta-header">
                <span className="marca">{tarjeta.marca}</span>
                <span className="exp">Exp. {tarjeta.expiracion}</span>
              </div>
              <span className="tarjeta-numero">
                •••• •••• •••• {tarjeta.ultimosDigitos}
              </span>
            </div>
            <button type="button" className="add-link">
              + Añadir tarjeta
            </button>
          </section>
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
