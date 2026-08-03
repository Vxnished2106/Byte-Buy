import React from "react";
import Header from "../components/Header";
import "../styles/sobre-nosotros.css";

export default function SobreNosotros() {
  return (
    <>
      <Header />
      <main className="page-container">
        <h1>Sobre Nosotros</h1>
        <p>Byte&Buy es un proyecto de ejemplo para gestionar compras y ventas.</p>
      </main>
    </>
  );
}
