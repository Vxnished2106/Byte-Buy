import React, { useState } from "react";
import type { CreateEtiqueta } from "../ts/interfaces";
import "../styles/modal-form.css";

export interface EtiquetaModalFormProps {
  onClose: () => void;
  onSave: (data: CreateEtiqueta) => Promise<void>;
}

export default function EtiquetaModalForm({
  onClose,
  onSave,
}: EtiquetaModalFormProps) {
  const [etiquetaNombre, setEtiquetaNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await onSave({ etiqueta_nombre: etiquetaNombre });
    } catch {
      setError("No se pudo guardar la etiqueta. Intenta nuevamente.");
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
          <h2>Nueva etiqueta</h2>
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
            <label htmlFor="etiqueta_nombre">Nombre de la etiqueta</label>
            <input
              id="etiqueta_nombre"
              type="text"
              placeholder="Ej. Popular"
              maxLength={50}
              value={etiquetaNombre}
              onChange={(e) => setEtiquetaNombre(e.target.value)}
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
