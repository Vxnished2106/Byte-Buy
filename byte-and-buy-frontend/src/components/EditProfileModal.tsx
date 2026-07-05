import React, { useState } from "react";

export interface ProfileData {
  nombre: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
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
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange("nombre")}
              required
            />
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
          <div className="field">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              type="tel"
              value={form.telefono}
              onChange={handleChange("telefono")}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
            <input
              id="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange("fechaNacimiento")}
              required
            />
          </div>
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
