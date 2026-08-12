import "../styles/modal-form.css";

export interface ConfirmModalProps {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Resalta el botón de confirmar como acción destructiva (ej. cancelar, eliminar). */
  peligro?: boolean;
  /** Deshabilita los botones y muestra el estado de espera en el de confirmar. */
  procesando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Modal de confirmación genérico, reemplazo de `window.confirm` con el estilo del sitio. */
export default function ConfirmModal({
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  peligro = false,
  procesando = false,
  onConfirmar,
  onCancelar,
}: ConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={() => !procesando && onCancelar()}>
      <div
        className="modal-form-content confirm-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-titulo"
      >
        <div className="modal-form-header">
          <h2 id="confirm-modal-titulo">{titulo}</h2>
          <button
            type="button"
            className="modal-form-close"
            onClick={onCancelar}
            disabled={procesando}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <p className="confirm-modal-mensaje">{mensaje}</p>

        <div className="modal-form-actions">
          <button
            type="button"
            className="modal-form-cancel"
            onClick={onCancelar}
            disabled={procesando}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className={`modal-form-save${peligro ? " modal-form-save-peligro" : ""}`}
            onClick={onConfirmar}
            disabled={procesando}
          >
            {procesando ? "Procesando…" : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
