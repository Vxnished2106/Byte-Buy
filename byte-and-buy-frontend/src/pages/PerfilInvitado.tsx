import { Link } from "react-router";
import Header from "../components/Header";
import "../styles/perfil.css";

export default function PerfilInvitado() {
  return (
    <>
      <Header />
      <div className="perfil-container">
        <div className="perfil-guest">
          <h3>Inicia sesion para ver tu perfil</h3>
          <p>Necesitas una cuenta para ver y editar tu informacion.</p>
          <div className="perfil-guest-actions">
            <Link to="/byte&buy/login" className="perfil-guest-link primary">
              Iniciar sesion
            </Link>
            <Link to="/byte&buy/register" className="perfil-guest-link secondary">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
