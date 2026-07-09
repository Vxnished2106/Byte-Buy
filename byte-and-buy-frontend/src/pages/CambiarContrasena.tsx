import React, { useState } from "react";
import { Link } from "react-router";
import "../styles/forgot-password.css";
import EyeOutline from "../assets/favicon/openEye";
import EyeCloseFill from "../assets/favicon/closeEye";
import Header from "../components/Header";
import { validarContrasena } from "../utils/validaciones";
import { useCambiarContrasena } from "../hooks/useCambiarContrasena";

export default function CambiarContrasena() {
  const { cambiar, loading, error, success } = useCambiarContrasena();
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [formError, setFormError] = useState("");

  const validations = validarContrasena(nuevaContrasena);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allValid = validations.every((validation) => validation.completed);
    if (!allValid) {
      setFormError("La contraseña no cumple con todos los requisitos");
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setFormError("Las contraseñas no coinciden");
      return;
    }
    setFormError("");
    await cambiar(contrasenaActual, nuevaContrasena);
  };

  return (
    <>
      <Header />
      <div className="form-container">
        <form className="forgot-form" onSubmit={handleSubmit}>
          {success ? (
            <>
              <div className="form-header">
                <h3>Contraseña actualizada</h3>
                <h5>Tu contraseña se cambio correctamente</h5>
              </div>
              <div className="fields">
                <div className="success-icon">✓</div>
                <p className="success-text">
                  Ya puedes seguir usando tu cuenta con tu nueva contraseña
                </p>
                <Link to={"/byte&buy/perfil"}>
                  <button type="button">Volver al perfil</button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="form-header">
                <h3>Cambiar contraseña</h3>
                <h5>Ingresa tu contraseña actual y la nueva contraseña</h5>
              </div>
              <div className="fields">
                <div className="field">
                  <label htmlFor="contrasenaActual">Contraseña actual</label>
                  <div className="input-with-icon">
                    <input
                      id="contrasenaActual"
                      type={showActual ? "text" : "password"}
                      placeholder="••••••••"
                      value={contrasenaActual}
                      onChange={(e) => setContrasenaActual(e.target.value)}
                      required
                    />
                    <span
                      className="eye-container"
                      onClick={() => setShowActual(!showActual)}
                    >
                      {showActual ? <EyeOutline /> : <EyeCloseFill />}
                    </span>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="nuevaContrasena">Nueva contraseña</label>
                  <div className="input-with-icon">
                    <input
                      id="nuevaContrasena"
                      type={showNueva ? "text" : "password"}
                      placeholder="••••••••"
                      value={nuevaContrasena}
                      onChange={(e) => setNuevaContrasena(e.target.value)}
                      required
                    />
                    <span
                      className="eye-container"
                      onClick={() => setShowNueva(!showNueva)}
                    >
                      {showNueva ? <EyeOutline /> : <EyeCloseFill />}
                    </span>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="confirmarContrasena">
                    Confirmar nueva contraseña
                  </label>
                  <div className="input-with-icon">
                    <input
                      id="confirmarContrasena"
                      type={showConfirmar ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmarContrasena}
                      onChange={(e) => setConfirmarContrasena(e.target.value)}
                      required
                    />
                    <span
                      className="eye-container"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                    >
                      {showConfirmar ? <EyeOutline /> : <EyeCloseFill />}
                    </span>
                  </div>
                </div>
                {nuevaContrasena.length > 0 && (
                  <ul className="password-validations">
                    {validations.map((validation) => (
                      <li
                        key={validation.text}
                        className={validation.completed ? "completed" : ""}
                      >
                        <span className="checked">
                          {validation.completed ? "✓" : ""}
                        </span>
                        {validation.text}
                      </li>
                    ))}
                  </ul>
                )}
                {(formError || error) && (
                  <p className="error-message">{formError || error}</p>
                )}
                <button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Cambiar contraseña"}
                </button>
                <p className="back-link">
                  <Link to={"/byte&buy/perfil"}>Volver al perfil</Link>
                </p>
              </div>
            </>
          )}
        </form>
      </div>
    </>
  );
}
