import React, { useState } from "react";
import { Link } from "react-router";
import "../styles/forgot-password.css";
import EyeOutline from "../assets/favicon/openEye";
import EyeCloseFill from "../assets/favicon/closeEye";
import Header from "../components/Header";
import { validarContrasena } from "../utils/validaciones";
import { useRecuperarContrasena } from "../hooks/useRecuperarContrasena";

/**
 * Página de recuperación de contraseña en 3 pasos: (1) solicitar el envío de un
 * código al correo, (2) ingresar el código y la nueva contraseña, (3) confirmación.
 * El paso actual (`step`) y las acciones de solicitud/confirmación vienen de
 * {@link useRecuperarContrasena}.
 */
export default function ForgotPassword() {
  const { step, email, loading, error, solicitar, confirmar } =
    useRecuperarContrasena();
  const [emailInput, setEmailInput] = useState("");
  const [codigo, setCodigo] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const validations = validarContrasena(newPassword);

  const handleShowPassword = () => setShowPassword(!showPassword);
  const handleShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    await solicitar(emailInput);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setFormError("Ingresa el código que enviamos a tu correo");
      return;
    }
    const allValid = validations.every((validation) => validation.completed);
    if (!allValid) {
      setFormError("La contraseña no cumple con todos los requisitos");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Las contraseñas no coinciden");
      return;
    }
    setFormError("");
    await confirmar(codigo, newPassword);
  };

  return (
    <>
      <Header />
      <div className="form-container">
        <form
          className="forgot-form"
          onSubmit={
            step === 1
              ? handleEmailSubmit
              : step === 2
                ? handlePasswordSubmit
                : undefined
          }
        >
          {step === 1 && (
            <>
              <div className="form-header">
                <h3>Olvidaste tu contraseña</h3>
                <h5>
                  Ingresa tu correo y te ayudaremos a recuperar tu cuenta
                </h5>
              </div>
              <div className="fields">
                <div className="field">
                  <label htmlFor="email">Correo electronico</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Continuar"}
                </button>
                <p className="back-link">
                  <Link to={"/byte&buy/login"}>Volver a iniciar sesion</Link>
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-header">
                <h3>Crea tu nueva contraseña</h3>
                <h5>Ingresa el código que enviamos a {email}</h5>
              </div>
              <div className="fields">
                <div className="field">
                  <label htmlFor="codigo">Código de verificación</label>
                  <input
                    id="codigo"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="newPassword">Nueva contraseña</label>
                  <div className="input-with-icon">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <span
                      className="eye-container"
                      onClick={handleShowPassword}
                    >
                      {showPassword ? <EyeOutline /> : <EyeCloseFill />}
                    </span>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="confirmPassword">
                    Confirmar contraseña
                  </label>
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
                {newPassword.length > 0 && (
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
                  {loading ? "Restableciendo..." : "Restablecer contraseña"}
                </button>
                <p className="back-link">
                  <Link to={"/byte&buy/login"}>Volver a iniciar sesion</Link>
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-header">
                <h3>Contraseña actualizada</h3>
                <h5>Tu contraseña se cambio correctamente</h5>
              </div>
              <div className="fields">
                <div className="success-icon">✓</div>
                <p className="success-text">
                  Ya puedes iniciar sesion en Byte&Buy con tu nueva contraseña
                </p>
                <Link to={"/byte&buy/login"}>
                  <button type="button">Ir a iniciar sesion</button>
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </>
  );
}
