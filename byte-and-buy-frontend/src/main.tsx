import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import Perfil from "./pages/Perfil.tsx";
import PerfilInvitado from "./pages/PerfilInvitado.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import CambiarContrasena from "./pages/CambiarContrasena.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import RequireAdmin from "./components/RequireAdmin.tsx";
import Admin from "./admin/admin.tsx";
import Productos from "./pages/Productos.tsx";
import DetalleProducto from "./pages/DetalleProducto.tsx";
import Carrito from "./pages/Carrito.tsx";
import Pago from "./pages/Pago.tsx";
import Facturacion from "./pages/Facturacion.tsx";
import PedidosLista from "./pages/PedidosLista.tsx";
import PedidoForm from "./pages/PedidoForm.tsx";
import PedidoDetalle from "./pages/PedidoDetalle.tsx";
import { CarritoProvider } from "./context/CarritoContext.tsx";

/**
 * Punto de entrada principal de la aplicación frontend.
 * Configura React Strict Mode, Router y proveedores de contexto.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CarritoProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/byte&buy/login" element={<Login />} />
          <Route path="/byte&buy/register" element={<Register />} />
          <Route path="/byte&buy/products" element={<Productos />} />
          <Route path="/byte&buy/products/:id" element={<DetalleProducto />} />
          <Route
            path="/byte&buy/perfil"
            element={
              <RequireAuth fallback={<PerfilInvitado />}>
                <Perfil />
              </RequireAuth>
            }
          />
          <Route path="/byte&buy/carrito" element={
            <RequireAuth fallback={<PerfilInvitado/>}>
              <Carrito/>
            </RequireAuth>
          }/>
          <Route path="/byte&buy/pago" element={
            <RequireAuth fallback={<PerfilInvitado/>}>
              <Pago/>
            </RequireAuth>
          }/>
          <Route path="/byte&buy/facturacion/:facturaId" element={
            <RequireAuth fallback={<PerfilInvitado/>}>
              <Facturacion/>
            </RequireAuth>
          }/>
          <Route path="/byte&buy/pedidos" element={
            <RequireAuth fallback={<PerfilInvitado/>}>
              <PedidosLista/>
            </RequireAuth>
          }/>
          <Route path="/byte&buy/pedidos/nuevo" element={
            <RequireAuth fallback={<PerfilInvitado/>}>
              <PedidoForm/>
            </RequireAuth>
          }/>
          <Route path="/byte&buy/pedidos/:id" element={
            <RequireAuth fallback={<PerfilInvitado/>}>
              <PedidoDetalle/>
            </RequireAuth>
          }/>
          <Route path="/byte&buy/pedidos/:id/editar" element={
            <RequireAuth fallback={<PerfilInvitado/>}>
              <PedidoForm/>
            </RequireAuth>
          }/>
          <Route path="/byte&buy/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/byte&buy/cambiar-contrasena"
            element={
              <RequireAuth>
                <CambiarContrasena />
              </RequireAuth>
            }
          />
          <Route
            path="/byte&buy/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
        </Routes>
      </CarritoProvider>
    </BrowserRouter>
  </StrictMode>,
);
