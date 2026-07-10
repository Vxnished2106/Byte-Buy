import React, { useState } from "react";
import type { productoData } from "../ts/interfaces";
import "../styles/modal-form.css";

export interface ProductoModalFormProps {
  initialData?: productoData | null;
  onClose: () => void;
  onSave: (data: productoData) => void;
}

const CATEGORIAS = [
  "Audio",
  "Componentes",
  "Perifericos",
  "Almacenamiento",
  "Monitores",
  "Accesorios",
];

const emptyProducto: productoData = {
  producto_id: 0,
  producto_nombre: "",
  producto_descripcion: "",
  producto_categoria: CATEGORIAS[0],
  producto_descuento: 0,
  producto_impuesto: 0,
  producto_imagen: "",
  producto_banner: "",
  producto_estado: true,
};

const fileName = (value: File | string) =>
  value instanceof File ? value.name : value;

export default function ProductoModalForm({
  initialData,
  onClose,
  onSave,
}: ProductoModalFormProps) {
  const [form, setForm] = useState<productoData>(
    initialData ?? emptyProducto,
  );
  const isEditing = Boolean(initialData);

  const handleChange =
    (field: keyof productoData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const handleNumberChange =
    (field: keyof productoData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: Number(e.target.value) });
    };

  const handleFileChange =
    (field: "producto_imagen" | "producto_banner") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setForm({ ...form, [field]: file });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal-form-content"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-form-header">
          <h2>{isEditing ? "Editar producto" : "Nuevo producto"}</h2>
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
          <div className="modal-form-field">
            <label htmlFor="producto_nombre">Nombre del producto</label>
            <input
              id="producto_nombre"
              type="text"
              placeholder="Ej. Auriculares Aura Pro"
              value={form.producto_nombre}
              onChange={handleChange("producto_nombre")}
              required
            />
          </div>
          <div className="modal-form-field">
            <label htmlFor="producto_descripcion">
              Descripcion del producto
            </label>
            <input
              id="producto_descripcion"
              type="text"
              placeholder="Descripcion de componentes"
              value={form.producto_descripcion}
              onChange={handleChange("producto_descripcion")}
              required
            />
          </div>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label htmlFor="producto_categoria">Categoria</label>
              <select
                id="producto_categoria"
                value={form.producto_categoria}
                onChange={handleChange("producto_categoria")}
              >
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-form-field">
              <label htmlFor="producto_estado">Estado</label>
              <select
                id="producto_estado"
                value={form.producto_estado ? "activo" : "inactivo"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    producto_estado: e.target.value === "activo",
                  })
                }
              >
                <option value="activo">Activado</option>
                <option value="inactivo">Desactivado</option>
              </select>
            </div>
          </div>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label htmlFor="producto_descuento">Descuento (%)</label>
              <input
                id="producto_descuento"
                type="number"
                min={0}
                placeholder="0"
                value={form.producto_descuento}
                onChange={handleNumberChange("producto_descuento")}
                required
              />
            </div>
            <div className="modal-form-field">
              <label htmlFor="producto_impuesto">Impuesto (%)</label>
              <input
                id="producto_impuesto"
                type="number"
                min={0}
                placeholder="0"
                value={form.producto_impuesto}
                onChange={handleNumberChange("producto_impuesto")}
                required
              />
            </div>
          </div>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label htmlFor="producto_imagen">Imagen de producto</label>
              <input
                id="producto_imagen"
                type="file"
                accept="image/*"
                onChange={handleFileChange("producto_imagen")}
              />
              {form.producto_imagen && (
                <span className="modal-form-preview">
                  {fileName(form.producto_imagen)}
                </span>
              )}
            </div>
            <div className="modal-form-field">
              <label htmlFor="producto_banner">Banner de producto</label>
              <input
                id="producto_banner"
                type="file"
                accept="image/*"
                onChange={handleFileChange("producto_banner")}
              />
              {form.producto_banner && (
                <span className="modal-form-preview">
                  {fileName(form.producto_banner)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="modal-form-actions">
          <button
            type="button"
            className="modal-form-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button type="submit" className="modal-form-save">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
