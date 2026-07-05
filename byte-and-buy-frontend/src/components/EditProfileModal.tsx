import React, { useState } from "react";
import { Link } from "react-router";

export interface ProfileData {
  nombre: string;
  apellido1: string;
  apellido2: string;
  correo: string;
}

interface EditProfileModalProps {
  profile: ProfileData;
  onClose: () => void;
  onSave: (profile: ProfileData) => void;
}

export default function EditProfileModal({
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [form, setForm] = useState<ProfileData>(profile);

  const handleChange =
    (field: keyof ProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal-content edit-profile-form"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="form-header">
          <h3>Editar perfil</h3>
          <h5>Actualiza tus datos personales</h5>
        </div>
        <div className="fields">
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange("nombre")}
              required
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="apellido1">Primer apellido</label>
              <input
                id="apellido1"
                type="text"
                value={form.apellido1}
                onChange={handleChange("apellido1")}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="apellido2">Segundo apellido</label>
              <input
                id="apellido2"
                type="text"
                value={form.apellido2}
                onChange={handleChange("apellido2")}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={form.correo}
              onChange={handleChange("correo")}
              required
            />
          </div>
          <p className="change-password">
            ¿Quieres cambiar tu contraseña?{" "}
            <Link to="/byte&buy/forgot-password">Cambiar contraseña</Link>
          </p>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar cambios
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
