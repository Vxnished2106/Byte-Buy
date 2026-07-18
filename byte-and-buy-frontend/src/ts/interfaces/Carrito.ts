import type { CarritoItem } from "./CarritoItem"

/**
 * Forma del carrito de un usuario.
 *
 * OJO: no coincide con `ResponseCarritoDto` del backend (que expone
 * `carrito_id`, `items: ResponseCarritoItemDto[]` y `total`, sin fechas).
 * Revisar nombres (`carritod_id`, `carrito_fecha_creacdion`,
 * `carritp_fecha_actualizacion` parecen typos) y el tipo de `items` antes
 * de usarlo en servicios/hooks.
 */
export interface Carrito{
    carrito_id:number
    usuario_id:number
    items: CarritoItem[]
    carrito_fecha_creacion:Date
    carrito_fecha_actualizacion:Date
}