import React from "react";
import "../styles/table.css"
type TableProps<T extends object> = {
  title: string;
  columns_name: string[];
  main_button_title: string;
  onAction_main_button: () => void;
  data: T[]
};
export default function Table<T extends object>({
  title,
  columns_name,
  onAction_main_button,
  main_button_title,
  data,
}: TableProps<T>) {
  return (
    <>
      <div className="table-section-header">
        <h3>{title}</h3>
        <button className="main_button" onClick={onAction_main_button}>
          {main_button_title}
        </button>
      </div>
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
            const isActive = Object.values(row).find(
              (value) => typeof value === "boolean"
            );
            const statusClass =
              isActive === false ? "table-row table-row-disabled" : "table-row";
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
                <button className="edit-button">Editar</button>
                <button className="delete-button">Desactivar</button>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
