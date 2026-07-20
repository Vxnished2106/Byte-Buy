import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import Header from "../components/Header";
import "../styles/register.css";
import EyeOutline from "../assets/favicon/openEye";
import EyeCloseFill from "../assets/favicon/closeEye";
import { register } from "../services/auth";
import { validarContrasena } from "../utils/validaciones";

/**
 * Página de registro de una nueva cuenta. Valida la confirmación de contraseña,
 * los requisitos de seguridad y la aceptación de términos antes de registrar al
 * usuario; si Supabase requiere confirmación por correo, muestra un aviso en
 * lugar de iniciar sesión automáticamente.
 */
export default function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const validations = validarContrasena(password);
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!validations.every((validation) => validation.completed)) {
      setError("La contraseña no cumple con todos los requisitos");
      return;
    }
    if (!accept) {
      setError("Debes aceptar los terminos y la politica de privacidad");
      return;
    }

    setLoading(true);
    try {
      const { requiereConfirmacion } = await register({
        nombre,
        apellido1: primerApellido,
        apellido2: segundoApellido,
        email,
        password,
      });

      if (requiereConfirmacion) {
        setError("Revisa tu correo para confirmar la cuenta antes de iniciar sesion");
        return;
      }

      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="form-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>Crear cuenta</h3>
            <h5>Unete a Byte&Buy y compra en segundos</h5>
          </div>
          <div className="fields">
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="primerApellido">Primer apellido</label>
                <input
                  id="primerApellido"
                  type="text"
                  placeholder="Primer apellido"
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="segundoApellido">Segundo apellido</label>
                <input
                  id="segundoApellido"
                  type="text"
                  placeholder="Segundo apellido"
                  value={segundoApellido}
                  onChange={(e) => setSegundoApellido(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="email">Correo electronico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field-row">
              <div className="field password-section">
                <label htmlFor="password">Contraseña</label>
                <div className="input-with-icon">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="eye-container" onClick={handleShowPassword}>
                    {showPassword ? <EyeOutline /> : <EyeCloseFill />}
                  </span>
                </div>
              </div>
              <div className="field confirm-password-container">
                <label htmlFor="confirmPassword">Confirmar</label>
                <div className="input-with-icon">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span
                    className="eye-container"
                    onClick={handleShowConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeOutline /> : <EyeCloseFill />}
                  </span>
                </div>
              </div>
            </div>
            {password.length > 0 && (
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
            <div className="terms">
              <input
                id="accept"
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
              />
              <label htmlFor="accept">
                Acepto los <span>Terminos del servicio</span> y la{" "}
                <span>Politica de privacidad</span>
              </label>
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
            <p className="login-link">
              Ya tienes cuenta? <Link to={"/byte&buy/login"}>Iniciar sesion</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
