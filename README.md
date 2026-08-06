# 🛒 Byte and Buy - E-commerce

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

![Stack Tecnológico](https://skillicons.dev/icons?i=react,ts,vite,nestjs,mysql,nodejs,supabase,jest)

**Byte and Buy** es una plataforma de comercio electrónico orientada a la venta de componentes de hardware, software y artículos tecnológicos. El proyecto está organizado como un monorepo con un frontend en React y un backend en NestJS totalmente desacoplados, comunicados vía API REST.

## 📁 Estructura del repositorio

```text
Byte-Buy/
├── byte-and-buy-frontend/   # SPA en React + Vite + TypeScript
└── byte-and-buy-backend/    # API REST en NestJS + TypeORM + MySQL
```

Cada carpeta es un proyecto Node independiente, con su propio `package.json` y sus propias dependencias.

## 🛠️ Stack Tecnológico

### Frontend (`byte-and-buy-frontend`)

* ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) **Framework:** React 19 + TypeScript
* ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) **Lenguaje:** TypeScript
* ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) **Build tool:** Vite (con React Compiler)
* ![React Router](https://img.shields.io/badge/-React_Router-CA4245?logo=reactrouter&logoColor=white) **Enrutamiento:** React Router
* **Gestión de estado:** Context API (p. ej. `CarritoContext`) + hooks personalizados
* ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white) **Cliente HTTP:** Axios
* ![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?logo=supabase&logoColor=white) **Autenticación / Storage:** Supabase JS Client

### Backend (`byte-and-buy-backend`)

* ![NestJS](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white) **Framework:** NestJS 11
* ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white) ![TypeORM](https://img.shields.io/badge/-TypeORM-FE0803?logo=typeorm&logoColor=white) **Base de datos:** MySQL (vía TypeORM)
* ![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?logo=supabase&logoColor=white) ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white) **Autenticación:** Supabase Auth + JWT (validación con `jose` / `jwks-rsa`)
* ![Nodemailer](https://img.shields.io/badge/-Nodemailer-22B573?logo=nodemailer&logoColor=white) **Correo electrónico:** Nodemailer + `@nestjs-modules/mailer` (recuperación de contraseña, notificaciones)
* **Generación de PDF:** PDFKit (facturación)
* **Validación:** class-validator / class-transformer
* **Tareas programadas:** `@nestjs/schedule`

## ✨ Funcionalidades principales

El backend expone módulos independientes para cada dominio del negocio, entre ellos:

* **Usuarios y autenticación** (`usuario`, `auth`, `token_recuperacion`) — registro, login, recuperación de contraseña.
* **Catálogo** (`catalogo`, `categoria`, `etiqueta`, `producto`, `producto_proveedor`, `proveedor`) — productos, categorías, etiquetas y proveedores.
* **Inventario** (`inventario`) — control de stock y alertas de stock bajo.
* **Carrito y pedidos** (`carrito`, `pedido`, `detalle_compra`, `direccion_envio`) — flujo de compra y direcciones de envío.
* **Pagos y facturación** (`pago`, `metodo_pago`, `venta`, `factura`) — procesamiento de pagos y generación de facturas en PDF.
* **Notificaciones** (`mail`) — envío de correos transaccionales.

El frontend consume estos módulos a través de páginas para catálogo, detalle de producto, carrito, checkout, historial y detalle de pedidos, perfil de usuario y un panel de administración (`src/admin`) para gestionar productos, categorías, etiquetas, proveedores e inventario.

---

## 📦 Instalación y Configuración

### Requisitos Previos

* Node.js (versión 18 o superior)
* PNPM
* Una instancia de MySQL (local o en la nube)
* Un proyecto de [Supabase](https://supabase.com) (para autenticación)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/byte-and-buy.git
cd byte-and-buy
```

### 2. Configurar el Backend

```bash
cd byte-and-buy-backend
pnpm install
```

Crea un archivo `.env` en `byte-and-buy-backend/` con las siguientes variables:

```env
# Base de datos
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=

# Supabase (autenticación)
SUPABASE_JWT_SECRET=
SUPABASE_URL=
SUPABASE_KEY=

# Correo (recuperación de contraseña, notificaciones)
MAIL_USER=
MAIL_PASS=
```

Levanta el servidor en modo desarrollo:

```bash
pnpm run start:dev
```

La API quedará disponible en `http://localhost:3000` por defecto.

Scripts útiles disponibles en el backend:

```bash
pnpm run seed        # Puebla la base de datos con datos iniciales
pnpm run reset-db     # Resetea la base de datos
pnpm run test         # Ejecuta pruebas unitarias
pnpm run test:e2e     # Ejecuta pruebas end-to-end
```

### 3. Configurar el Frontend

```bash
cd byte-and-buy-frontend
pnpm install
```

Crea un archivo `.env` en `byte-and-buy-frontend/` con las siguientes variables:

```env
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Levanta el servidor de desarrollo:

```bash
pnpm run dev
```

La aplicación quedará disponible en `http://localhost:5173` por defecto.

---

## 🧪 Pruebas

El backend incluye pruebas unitarias y end-to-end con Jest:

```bash
cd byte-and-buy-backend
pnpm run test
pnpm run test:e2e
pnpm run test:cov
```

## 📄 Licencia

Este proyecto es de uso privado / educativo.
