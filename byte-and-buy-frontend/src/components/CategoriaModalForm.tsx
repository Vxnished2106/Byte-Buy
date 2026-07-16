import React, { useState } from "react";
import type { CreateCategoria } from "../ts/interfaces";
import "../styles/modal-form.css";

export interface CategoriaModalFormProps {
  onClose: () => void;
  onSave: (data: CreateCategoria, imagen?: File) => Promise<void>;
}

const emptyCategoria: CreateCategoria = {
  categoria_nombre: "",
  categoria_descripcion: "",
};

export default function CategoriaModalForm({
  onClose,
  onSave,
}: CategoriaModalFormProps) {
  const [form, setForm] = useState<CreateCategoria>(emptyCategoria);
  const [imagen, setImagen] = useState<File | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagen(e.target.files?.[0]);
  };

  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
    if (e.currentTarget.validity.valueMissing) {
      e.currentTarget.setCustomValidity("Por favor ingresa el nombre de la categoria.");
    } else {
      e.currentTarget.setCustomValidity("");
    }
  };

  const clearValidity = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.setCustomValidity("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await onSave(form, imagen);
    } catch {
      setError("No se pudo guardar la categoria. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal-form-content"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-form-header">
          <h2>Nueva categoria</h2>
          <button
            type="button"
            className="modal-form-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>
        <div className="modal-form-fields">
          {error && <span className="modal-form-error">{error}</span>}
          <div className="modal-form-field">
            <label htmlFor="categoria_nombre">Nombre de la categoria</label>
            <input
              id="categoria_nombre"
              type="text"
              placeholder="Ej. Audio"
              value={form.categoria_nombre}
              onChange={(e) =>
                setForm({ ...form, categoria_nombre: e.target.value })
              }
              onInvalid={handleInvalid}
              onInput={clearValidity}
              required
            />
          </div>
          <div className="modal-form-field">
            <label htmlFor="categoria_descripcion">Descripcion</label>
            <input
              id="categoria_descripcion"
              type="text"
              placeholder="Descripcion de la categoria"
              value={form.categoria_descripcion}
              onChange={(e) =>
                setForm({ ...form, categoria_descripcion: e.target.value })
              }
            />
          </div>
          <div className="modal-form-field">
            <label htmlFor="categoria_imagen">Imagen</label>
            <input
              id="categoria_imagen"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {imagen && <span className="modal-form-preview">{imagen.name}</span>}
          </div>
        </div>
        <div className="modal-form-actions">
          <button
            type="button"
            className="modal-form-cancel"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button type="submit" className="modal-form-save" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
