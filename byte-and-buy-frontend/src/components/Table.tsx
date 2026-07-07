import React from "react";
import "../styles/table.css"
type TableProps = {
  title: string;
  columns_name: string[];
  main_button_title: string;
  onAction_main_button: () => void;
  data: (string | number)[][];
};
export default function Table({
  title,
  columns_name,
  onAction_main_button,
  main_button_title,
  data,
}: TableProps) {
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
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
              <td className="table-actions">
                <button className="edit-button">Editar</button>
                <button className="delete-button">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
