import React, { useState } from "react";
import { Link } from "react-router";
import "../styles/login.css";
import EyeOutline from "../assets/favicon/openEye";
import EyeCloseFill from "../assets/favicon/closeEye";
import Header from "../components/Header";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <Header />
      <div className="form-container">
        <form action="post" className="login-form">
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
              <Link to={"/"}>¿Olvidaste tu contraseña?</Link>
            </div>
            <button type="submit">Iniciar sesion</button>

            <p className="register-link">
              ¿No tienes cuenta? <Link to={"/register"}>Crear cuenta</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
