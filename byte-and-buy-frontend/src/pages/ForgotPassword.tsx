import React, { useState } from "react";
import { Link } from "react-router";
import "../styles/forgot-password.css";
import EyeOutline from "../assets/favicon/openEye";
import EyeCloseFill from "../assets/favicon/closeEye";
import Header from "../components/Header";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const validations = [
    {
      text: "Minimo 8 caracteres",
      completed: newPassword.length >= 8,
    },
    {
      text: "Uso de mayusculas",
      completed: /[A-Z]/.test(newPassword),
    },
    {
      text: "Uso de numeros",
      completed: /[0-9]/.test(newPassword),
    },
    {
      text: "Uso de caracteres especiales",
      completed: /[!@#$%^&*()?:{}|<>]/.test(newPassword),
    },
  ];

  const handleShowPassword = () => setShowPassword(!showPassword);
  const handleShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allValid = validations.every((validation) => validation.completed);
    if (!allValid) {
      setError("La contraseña no cumple con todos los requisitos");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setError("");
    setStep(3);
  };

  return (
    <>
      <Header />
      <div className="form-container">
        <form
          action="post"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit">Continuar</button>
                <p className="back-link">
                  <Link to={"/buy&buy/login"}>Volver a iniciar sesion</Link>
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-header">
                <h3>Crea tu nueva contraseña</h3>
                <h5>Estamos restableciendo la cuenta de {email}</h5>
              </div>
              <div className="fields">
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
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Restablecer contraseña</button>
                <p className="back-link">
                  <Link to={"/buy&buy/login"}>Volver a iniciar sesion</Link>
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
                <Link to={"/buy&buy/login"}>
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
