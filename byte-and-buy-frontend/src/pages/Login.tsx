import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import "../styles/login.css";
import EyeOutline from "../assets/favicon/openEye";
import EyeCloseFill from "../assets/favicon/closeEye";
import Header from "../components/Header";
import { login } from "../services/auth";
import { Rol } from "../ts/interfaces";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const usuario = await login(email, password);
      navigate(usuario.usuario_rol === Rol.ADMIN ? "/byte&buy/admin" : "/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesion",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h3>Iniciar sesion</h3>
            <h5>Bienvenido de nuevo a Byte&Buy</h5>
          </div>
          <div className="fields">
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
            <div className="field">
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
            <div className="extra-actions">
              <Link to={"/byte&buy/forgot-password"}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            {error && (
              <p className="error-message">Correo o contraseña incorrectos</p>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Iniciando sesion..." : "Iniciar sesion"}
            </button>

            <p className="register-link">
              ¿No tienes cuenta?{" "}
              <Link to={"/byte&buy/register"}>Crear cuenta</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
