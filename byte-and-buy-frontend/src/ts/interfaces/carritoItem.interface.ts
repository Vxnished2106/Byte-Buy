/**
 * Item de un carrito.
 *
 * Incompleto: al backend (`ResponseCarritoItemDto`) le faltan aquí
 * `producto_id`, `producto_nombre`, `precio_unitario`, `descuento`,
 * `impuesto`, `precio_final_unitario`, `cantidad` y `subtotal`.
 */
export interface CarritoItem{
    carrito_item_id:number
    carrito_id:number
    producto_id:number
    producto_nombre:string
    impuesto:number
    precio_final_unitario:number
    cantidad:number,
    subtotal:number
}