import React from "react";
import { useNavigate } from "react-router";

interface Props {
  nombre: string;
  conteo: number;
  color: string;
}

export default function CategoryCard({ nombre, conteo, color }: Props) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/byte&buy/products?categoria=${encodeURIComponent(nombre)}`);
  };

  return (
    <a href={`/byte&buy/products?categoria=${encodeURIComponent(nombre)}`} onClick={handleClick} className="category-card">
      <div className="category-icon-bg" style={{ backgroundColor: `${color}15` }}>
        <div className="category-icon-dot" style={{ backgroundColor: color }} />
      </div>
      <div className="category-info">
        <h3 className="category-name">{nombre}</h3>
        <p className="category-count">{conteo} productos</p>
      </div>
      <div className="category-arrow">→</div>
    </a>
  );
}
