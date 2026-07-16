import React, { useEffect, useState } from "react";
import type {
  Categoria,
  Etiqueta,
  ProductoFormValues,
  proveedorData,
} from "../ts/interfaces";
import "../styles/modal-form.css";

export interface ProductoModalFormProps {
  initialData?: ProductoFormValues | null;
  categorias: Categoria[];
  etiquetas: Etiqueta[];
  proveedores: proveedorData[];
  onClose: () => void;
  onSave: (data: ProductoFormValues) => Promise<void>;
}

const emptyProducto: ProductoFormValues = {
  producto_id: 0,
  producto_nombre: "",
  producto_descripcion: "",
  producto_precio: 0,
  producto_descuento: 0,
  producto_impuesto: 0,
  producto_imagen: "",
  producto_banner: "",
  producto_estado: true,
  categoria_ids: [],
  etiqueta_ids: [],
  stock_actual: 0,
  stock_minimo: 0,
  proveedor_id: 0,
  precio_compra: 0,
};

export default function ProductoModalForm({
  initialData,
  categorias,
  etiquetas,
  proveedores,
  onClose,
  onSave,
}: ProductoModalFormProps) {
  const [form, setForm] = useState<ProductoFormValues>(
    initialData ?? emptyProducto,
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (form.producto_imagen instanceof File) {
      const url = URL.createObjectURL(form.producto_imagen);
      setImagenPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setImagenPreview(form.producto_imagen || null);
  }, [form.producto_imagen]);

  useEffect(() => {
    if (form.producto_banner instanceof File) {
      const url = URL.createObjectURL(form.producto_banner);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setBannerPreview(form.producto_banner || null);
  }, [form.producto_banner]);

  const handleChange =
    (field: keyof ProductoFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const requiredMessages: Partial<Record<keyof ProductoFormValues, string>> = {
    producto_nombre: "Por favor ingresa el nombre del producto.",
    producto_descripcion: "Por favor ingresa la descripcion del producto.",
    producto_precio: "Por favor ingresa el precio del producto.",
    precio_compra: "Por favor ingresa el precio de compra del producto.",
  };

  const handleInvalid =
    (field: keyof ProductoFormValues) =>
    (e: React.InvalidEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valueMissing) {
        e.currentTarget.setCustomValidity(requiredMessages[field] ?? "Este campo es obligatorio.");
      } else if (e.currentTarget.validity.rangeUnderflow) {
        e.currentTarget.setCustomValidity("El valor no puede ser negativo.");
      } else {
        e.currentTarget.setCustomValidity("");
      }
    };

  const clearValidity = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.setCustomValidity("");
  };

  const handleNumberChange =
    (field: keyof ProductoFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setForm({ ...form, [field]: raw === "" ? 0 : Number(raw) });
    };

  // Muestra vacio en vez de "0": si el input parte en 0 y el usuario escribe
  // un digito, el navegador lo antepone ("0" + "1" tipeado = "01"); como
  // Number("01") === 1 es el mismo valor que React ya tenia, no vuelve a
  // pintar el input y el cero queda pegado visualmente aunque el estado ya
  // sea el numero correcto. Al no haber ningun caracter previo, ese problema
  // no ocurre.
  const numeroInput = (valor: number) => (valor === 0 ? "" : valor);

  const handleFileChange =
    (field: "producto_imagen" | "producto_banner") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setForm({ ...form, [field]: file });
    };

  const handleCategoriaToggle = (categoria_id: number) => {
    setForm((prev) => {
      const seleccionado = prev.categoria_ids.includes(categoria_id);
      return {
        ...prev,
        categoria_ids: seleccionado
          ? prev.categoria_ids.filter((id) => id !== categoria_id)
          : [...prev.categoria_ids, categoria_id],
      };
    });
  };

  const handleEtiquetaToggle = (etiqueta_id: number) => {
    setForm((prev) => {
      const seleccionado = prev.etiqueta_ids.includes(etiqueta_id);
      return {
        ...prev,
        etiqueta_ids: seleccionado
          ? prev.etiqueta_ids.filter((id) => id !== etiqueta_id)
          : [...prev.etiqueta_ids, etiqueta_id],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await onSave(form);
    } catch {
      setError("No se pudo guardar el producto. Intenta nuevamente.");
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
          {error && <span className="modal-form-error">{error}</span>}
          <div className="modal-form-field">
            <label htmlFor="producto_nombre">Nombre del producto</label>
            <input
              id="producto_nombre"
              type="text"
              placeholder="Ej. Auriculares Aura Pro"
              value={form.producto_nombre}
              onChange={handleChange("producto_nombre")}
              onInvalid={handleInvalid("producto_nombre")}
              onInput={clearValidity}
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
              onInvalid={handleInvalid("producto_descripcion")}
              onInput={clearValidity}
              required
            />
          </div>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label htmlFor="producto_precio">Precio</label>
              <input
                id="producto_precio"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={numeroInput(form.producto_precio)}
                onChange={handleNumberChange("producto_precio")}
                onInvalid={handleInvalid("producto_precio")}
                onInput={clearValidity}
                required
              />
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
          <div className="modal-form-field">
            <label>Categorias</label>
            <div className="modal-form-checkbox-group">
              {categorias.map((categoria) => (
                <label
                  key={categoria.categoria_id}
                  className="modal-form-checkbox"
                >
                  <input
                    type="checkbox"
                    checked={form.categoria_ids.includes(
                      categoria.categoria_id,
                    )}
                    onChange={() =>
                      handleCategoriaToggle(categoria.categoria_id)
                    }
                  />
                  {categoria.categoria_nombre}
                </label>
              ))}
            </div>
          </div>
          <div className="modal-form-field">
            <label>Etiquetas</label>
            <div className="modal-form-checkbox-group">
              {etiquetas.map((etiqueta) => (
                <label
                  key={etiqueta.etiqueta_id}
                  className="modal-form-checkbox"
                >
                  <input
                    type="checkbox"
                    checked={form.etiqueta_ids.includes(etiqueta.etiqueta_id)}
                    onChange={() => handleEtiquetaToggle(etiqueta.etiqueta_id)}
                  />
                  {etiqueta.etiqueta_nombre}
                </label>
              ))}
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
                value={numeroInput(form.producto_descuento)}
                onChange={handleNumberChange("producto_descuento")}
              />
            </div>
            <div className="modal-form-field">
              <label htmlFor="producto_impuesto">Impuesto (%)</label>
              <input
                id="producto_impuesto"
                type="number"
                min={0}
                placeholder="0"
                value={numeroInput(form.producto_impuesto)}
                onChange={handleNumberChange("producto_impuesto")}
              />
            </div>
          </div>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label htmlFor="stock_actual">Stock actual</label>
              <input
                id="stock_actual"
                type="number"
                min={0}
                placeholder="0"
                value={numeroInput(form.stock_actual)}
                onChange={handleNumberChange("stock_actual")}
              />
            </div>
            <div className="modal-form-field">
              <label htmlFor="stock_minimo">Stock minimo</label>
              <input
                id="stock_minimo"
                type="number"
                min={0}
                placeholder="0"
                value={numeroInput(form.stock_minimo)}
                onChange={handleNumberChange("stock_minimo")}
              />
            </div>
          </div>
          <div className="modal-form-row">
            <div className="modal-form-field">
              <label htmlFor="proveedor_id">Proveedor</label>
              <select
                id="proveedor_id"
                value={form.proveedor_id}
                onChange={(e) =>
                  setForm({ ...form, proveedor_id: Number(e.target.value) })
                }
              >
                <option value={0}>Sin proveedor</option>
                {proveedores
                  .filter(
                    (proveedor) =>
                      proveedor.proveedor_estado ||
                      proveedor.proveedor_id === form.proveedor_id,
                  )
                  .map((proveedor) => (
                    <option
                      key={proveedor.proveedor_id}
                      value={proveedor.proveedor_id}
                    >
                      {proveedor.proveedor_nombre}
                    </option>
                  ))}
              </select>
            </div>
            <div className="modal-form-field">
              <label htmlFor="precio_compra">Precio de compra</label>
              <input
                id="precio_compra"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={numeroInput(form.precio_compra)}
                onChange={handleNumberChange("precio_compra")}
                onInvalid={handleInvalid("precio_compra")}
                onInput={clearValidity}
                disabled={!form.proveedor_id}
                required={Boolean(form.proveedor_id)}
              />
            </div>
          </div>
          <div className="modal-form-column">
            <div className="modal-form-field">
              <label htmlFor="producto_imagen">Imagen de producto</label>
              <input
                id="producto_imagen"
                type="file"
                accept="image/*"
                onChange={handleFileChange("producto_imagen")}
              />
              {imagenPreview && (
                <img
                  src={imagenPreview}
                  alt="Vista previa de la imagen del producto"
                  className="modal-form-image-preview"
                />
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
              {bannerPreview && (
                <img
                  src={bannerPreview}
                  alt="Vista previa del banner del producto"
                  className="modal-form-image-preview"
                />
              )}
            </div>
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
