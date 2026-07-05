import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import Perfil from "./pages/Perfil.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/buy&buy/login" element={<Login />} />
        <Route path="/buy&buy/register" element={<Register />} />
        <Route path="/buy&buy/perfil" element={<Perfil/>}/>
        <Route path="/buy&buy/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
