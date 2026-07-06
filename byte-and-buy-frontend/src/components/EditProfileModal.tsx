import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

export interface ProfileData {
  nombre: string;
  apellido1: string;
  apellido2: string;
  correo: string;
  foto?: string | null;
}

interface EditProfileModalProps {
  profile: ProfileData;
  onClose: () => void;
  onSave: (profile: ProfileData, foto?: File) => void | Promise<void>;
  saving?: boolean;
  error?: string;
}

const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024;

export default function EditProfileModal({
  profile,
  onClose,
  onSave,
  saving = false,
  error = "",
}: EditProfileModalProps) {
  const [form, setForm] = useState<ProfileData>(profile);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    profile.foto ?? null,
  );
  const [fotoError, setFotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (fotoPreview?.startsWith("blob:")) URL.revokeObjectURL(fotoPreview);
    };
  }, [fotoPreview]);

  const iniciales = [form.nombre, form.apellido1]
    .filter(Boolean)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase();

  const handleChange =
    (field: keyof ProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFotoError("El archivo debe ser una imagen");
      return;
    }
    if (file.size > TAMANO_MAXIMO_FOTO) {
      setFotoError("La imagen no debe superar los 5MB");
      return;
    }

    setFotoError("");
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, fotoFile ?? undefined);
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
          <div className="modal-avatar">
            <div className="modal-avatar-preview">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Foto de perfil" />
              ) : (
                <span>{iniciales}</span>
              )}
            </div>
            <div className="modal-avatar-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                Cambiar foto
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                hidden
              />
            </div>
          </div>
          {fotoError && <p className="error-message">{fotoError}</p>}
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
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
