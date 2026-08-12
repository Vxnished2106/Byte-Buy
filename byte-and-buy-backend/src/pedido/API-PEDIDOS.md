# Contrato de API — Módulo de Pedidos

Base URL: la del backend (`VITE_API_URL`, p. ej. `http://localhost:3000`).
Todas las rutas requieren `Authorization: Bearer <token Supabase>` (guard `SupabaseAuthGuard`).
El servidor **siempre recalcula los importes**; los totales enviados por el cliente se ignoran.

## Estados y transiciones

```
BORRADOR ──▶ CONFIRMADO ──▶ EN_PREPARACION ──▶ ENTREGADO
   │             │                │
   └─────────────┴────────────────┴──────────▶ CANCELADO
```

- `CONFIRMADO` exige dirección de envío y **descuenta stock**.
- `CANCELADO` desde `CONFIRMADO`/`EN_PREPARACION` **repone stock**.
- `ENTREGADO` y `CANCELADO` son terminales.

## Endpoints

### `POST /pedidos` — Crear pedido (BORRADOR)
Header opcional `Idempotency-Key: <uuid>` para evitar duplicados por reintento.

```jsonc
// Request
{
  "cliente_id": 7,
  "pedido_fecha": "2026-07-30T10:00:00Z",   // opcional (default: ahora)
  "pedido_notas": "Entregar en la tarde",    // opcional
  "direccion_envio_id": 10,                    // opcional en BORRADOR
  "items": [
    { "producto_id": 100, "cantidad": 2 },
    { "producto_id": 200, "cantidad": 1, "precio_unitario": 50, "descuento_pct": 10 }
  ]
}
```
Respuesta `201`: objeto `Pedido` (ver esquema abajo).

### `GET /pedidos` — Listado paginado (server-side)
Query params (todos opcionales):

| Param | Tipo | Notas |
|---|---|---|
| `estado` | enum | Filtra por estado |
| `cliente_id` | int | Filtra por cliente |
| `fecha_desde` / `fecha_hasta` | ISO 8601 | Rango sobre `pedido_fecha` |
| `buscar` | string | LIKE sobre número de pedido y notas |
| `orden_por` | `pedido_fecha`\|`pedido_total`\|`pedido_numero`\|`created_at` | Default `created_at` |
| `orden_dir` | `ASC`\|`DESC` | Default `DESC` |
| `page` | int ≥ 1 | Default 1 |
| `limit` | int 1–100 | Default 20 |

```jsonc
// Respuesta 200
{ "data": [ /* Pedido[] */ ], "total": 137, "page": 1, "limit": 20, "total_paginas": 7 }
```

### `GET /pedidos/:id` — Detalle (incluye `historial`)
Respuesta `200`: objeto `Pedido` con `detalles[]` e `historial[]`.

### `PUT /pedidos/:id` — Editar cabecera y líneas (solo BORRADOR)
Requiere `pedido_version` (concurrencia optimista). Reemplaza el set de líneas.

```jsonc
{ "pedido_version": 0, "pedido_notas": "...", "direccion_envio_id": 10,
  "items": [ { "producto_id": 100, "cantidad": 3 } ] }
```

### `PATCH /pedidos/:id/estado` — Transición de estado
```jsonc
{ "nuevo_estado": "CONFIRMADO", "pedido_version": 0, "nota": "Pago verificado" }
```

### `PATCH /pedidos/:id/confirmar-pago` — Confirmar tras un pago externo al módulo
Sin body. Deja un pedido `BORRADOR` en `CONFIRMADO` **sin descontar stock** (a
diferencia de `PATCH /pedidos/:id/estado` con `CONFIRMADO`).

Existe porque el checkout de compra (`venta`/`pago`/`detalle_compra`) es un
módulo aparte del de pedidos: descuenta el stock por su cuenta al pagar, sin
pasar por `cambiarEstado`. Si el pedido asociado a esa compra se dejara en
`BORRADOR`, cancelarlo después no repondría el stock (`reponerStock` solo se
dispara al cancelar desde `CONFIRMADO`/`EN_PREPARACION`). El frontend llama a
este endpoint justo después de que el pago se complete (`Pago.tsx` y el flujo
de respaldo en `PedidoForm.tsx`), para que el estado del pedido quede
consistente con el stock ya descontado.

No exige `pedido_version` ni dirección de envío (no es una transición elegida
por el usuario, sino un ajuste de estado posterior a una venta ya
registrada). Es idempotente: si el pedido ya no está en `BORRADOR`, no hace
nada y devuelve su estado actual.

## Esquema `Pedido` (respuesta)

```jsonc
{
  "pedido_id": 1, "pedido_numero": "PED-000001",
  "cliente_id": 7, "direccion_envio_id": 10,
  "pedido_fecha": "2026-07-30T10:00:00.000Z", "pedido_notas": null,
  "pedido_estado": "BORRADOR",
  "pedido_subtotal": 200, "pedido_descuento_total": 0,
  "pedido_impuesto_total": 26, "pedido_total": 226,
  "pedido_version": 0, "created_by": 7, "updated_by": 7,
  "created_at": "...", "updated_at": "...",
  "detalles": [
    { "detalle_pedido_id": 1, "producto_id": 100, "producto_nombre": "Smartphone",
      "detalle_pedido_cantidad": 2, "detalle_pedido_precio_unitario": 100,
      "detalle_pedido_descuento_pct": 0, "detalle_pedido_impuesto_pct": 13,
      "detalle_pedido_subtotal": 200, "detalle_pedido_descuento_monto": 0,
      "detalle_pedido_impuesto_monto": 26, "detalle_pedido_total": 226 }
  ],
  "historial": [
    { "historial_id": 1, "estado_anterior": null, "estado_nuevo": "BORRADOR",
      "usuario_id": 7, "historial_nota": "Pedido creado", "created_at": "..." }
  ]
}
```

## Catálogo de errores

| HTTP | Situación |
|---|---|
| `400` | Forma inválida (DTO): falta cliente, `items` vacío, cantidad < 1, tipos/rangos. Detalle por campo/índice de línea. |
| `400` | Negocio de línea: producto inexistente/inactivo, duplicado, descuento fuera de 0–100, sin dirección al confirmar. |
| `403` | Sin permiso sobre el pedido; dirección no pertenece al cliente. |
| `404` | Pedido, cliente o dirección inexistentes. |
| `409` | Versión desactualizada (concurrencia), transición de estado inválida, stock insuficiente. |

Cálculo de importes por línea (redondeo a 2 decimales por línea, luego suma):
`subtotal = precio × cantidad` · `descuento = subtotal × desc%` ·
`impuesto = (subtotal − descuento) × imp%` · `total = subtotal − descuento + impuesto`.
