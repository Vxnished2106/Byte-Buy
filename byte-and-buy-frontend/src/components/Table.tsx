import "../styles/table.css"
type TableProps<T extends object> = {
  /** Título mostrado sobre la tabla. */
  title: string;
  /** Nombres de las columnas de datos (además de "Estados" y "Acciones", que son fijas). */
  columns_name: string[];
  /** Texto del botón principal (ej. "Nuevo producto"). */
  main_button_title: string;
  /** Acción del botón principal (normalmente abre un modal de creación). */
  onAction_main_button: () => void;
  /** Acción al pulsar "Editar" en una fila. */
  onEdit?: (row: T) => void;
  /** Acción al activar/desactivar una fila; recibe la fila con el campo booleano invertido. */
  onToggleEstado?: (row: T) => void;
  /** Filas a renderizar. Cada valor booleano se detecta automáticamente como el estado de la fila. */
  data: T[]
  /** Oculta el botón de activar/desactivar cuando la entidad no maneja estado. */
  hideToggleEstado?: boolean;
};

/**
 * Tabla genérica de administración: renderiza cualquier arreglo de objetos como filas,
 * detecta el primer campo booleano de cada fila como su "estado" y expone acciones de
 * editar y activar/desactivar por fila.
 */
export default function Table<T extends object>({
  title,
  columns_name,
  onAction_main_button,
  main_button_title,
  onEdit,
  onToggleEstado,
  data,
  hideToggleEstado,
}: TableProps<T>) {
  return (
    <>
      <div className="table-section-header">
        <h3>{title}</h3>
        <button className="main_button" onClick={onAction_main_button}>
          {main_button_title}
        </button>
      </div>
      <div className="table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            {columns_name.map((columns_name, i) => (
              <th key={i}>{columns_name}</th>
            ))}
            <th>Estados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const estadoEntry = Object.entries(row).find(
              ([, value]) => typeof value === "boolean"
            );
            const isActive = estadoEntry?.[1] as boolean | undefined;
            const sinStock =
              "producto_stock" in row && (row as Record<string, unknown>).producto_stock === 0;
            const statusClass = [
              "table-row",
              isActive === false ? "table-row-disabled" : "",
              sinStock ? "table-row-sin-stock" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const handleToggleEstado = () => {
              if (!estadoEntry) return;
              const [estadoKey, estadoValue] = estadoEntry;
              onToggleEstado?.({
                ...row,
                [estadoKey]: !estadoValue,
              });
            };
            return (
            <tr key={rowIndex} className={statusClass}>
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {typeof cell === "boolean"
                    ? cell
                      ? "Activado"
                      : "Desactivado"
                    : String(cell)}
                </td>
              ))}
              <td className="table-actions">
                <button
                  className="edit-button"
                  onClick={() => onEdit?.(row)}
                >
                  Editar
                </button>
                {!hideToggleEstado && (
                  <button
                    className="delete-button"
                    onClick={handleToggleEstado}
                    disabled={!estadoEntry}
                  >
                    {isActive === false ? "Activar" : "Desactivar"}
                  </button>
                )}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </>
  );
}
