import React, { useState } from "react";
import type { proveedorData } from "../ts/interfaces";
import "../styles/modal-form.css";

export interface ProveedorModalFormProps {
  /** Datos del proveedor a editar; si se omite, el formulario crea uno nuevo. */
  initialData?: proveedorData | null;
  /** Cierra el modal sin guardar. */
  onClose: () => void;
  /** Guarda el proveedor (creación o edición según initialData). */
  onSave: (data: proveedorData) => Promise<void>;
}

const emptyProveedor: proveedorData = {
  proveedor_id: 0,
  proveedor_nombre: "",
  proveedor_correo: "",
  proveedor_telefono: "",
  proveedor_direccion: "",
  proveedor_estado: true,
};

/** Modal con el formulario para crear o editar un proveedor. */
export default function ProveedorModalForm({
  initialData,
  onClose,
  onSave,
}: ProveedorModalFormProps) {
  const [form, setForm] = useState<proveedorData>(
    initialData ?? emptyProveedor,
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(initialData);

  const handleChange =
    (field: keyof proveedorData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const requiredMessages: Partial<Record<keyof proveedorData, string>> = {
    proveedor_nombre: "Por favor ingresa el nombre del proveedor.",
    proveedor_correo: "Por favor ingresa un correo electronico valido.",
    proveedor_telefono: "Por favor ingresa el telefono del proveedor.",
    proveedor_direccion: "Por favor ingresa la direccion del proveedor.",
  };

  const handleInvalid =
    (field: keyof proveedorData) =>
    (e: React.InvalidEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valueMissing) {
        e.currentTarget.setCustomValidity(requiredMessages[field] ?? "Este campo es obligatorio.");
      } else if (e.currentTarget.validity.typeMismatch) {
        e.currentTarget.setCustomValidity("El formato ingresado no es valido.");
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
      await onSave(form);
    } catch {
      setError("No se pudo guardar el proveedor. Intenta nuevamente.");
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
          <h2>{isEditing ? "Editar proveedor" : "Nuevo proveedor"}</h2>
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
            <label htmlFor="proveedor_nombre">Nombre del proveedor</label>
            <input
              id="proveedor_nombre"
              type="text"
              placeholder="Ej. Nvidia"
              value={form.proveedor_nombre}
              onChange={handleChange("proveedor_nombre")}
              onInvalid={handleInvalid("proveedor_nombre")}
              onInput={clearValidity}
              required
            />
          </div>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label htmlFor="proveedor_correo">Correo</label>
              <input
                id="proveedor_correo"
                type="email"
                placeholder="proveedor@correo.com"
                value={form.proveedor_correo}
                onChange={handleChange("proveedor_correo")}
                onInvalid={handleInvalid("proveedor_correo")}
                onInput={clearValidity}
                required
              />
            </div>
            <div className="modal-form-field">
              <label htmlFor="proveedor_telefono">Telefono</label>
              <input
                id="proveedor_telefono"
                type="tel"
                placeholder="+101 65437786"
                value={form.proveedor_telefono}
                onChange={handleChange("proveedor_telefono")}
                onInvalid={handleInvalid("proveedor_telefono")}
                onInput={clearValidity}
                required
              />
            </div>
          </div>
          <div className="modal-form-field">
            <label htmlFor="proveedor_direccion">Direccion</label>
            <input
              id="proveedor_direccion"
              type="text"
              placeholder="Ohaio, USA, wolf street"
              value={form.proveedor_direccion}
              onChange={handleChange("proveedor_direccion")}
              onInvalid={handleInvalid("proveedor_direccion")}
              onInput={clearValidity}
              required
            />
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
