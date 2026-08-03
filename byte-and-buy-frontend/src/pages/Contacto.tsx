import React from "react";
import Header from "../components/Header";
import "../styles/header.css";

export default function Contacto() {
  return (
    <>
      <Header />
      <main className="page-container">
        <h1>Contacto</h1>
        <p>
          Si tienes dudas o quieres ponerte en contacto con nosotros, envía un
          mensaje a soporte@byteandbuy.example (archivo de ejemplo).
        </p>
      </main>
    </>
  );
}
