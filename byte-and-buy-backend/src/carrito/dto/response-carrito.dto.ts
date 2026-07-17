export class ResponseCarritoItemDto {
  producto_id: number;
  producto_nombre: string;
  // Precio de lista del producto.
  precio_unitario: number;
  // Porcentajes aplicados sobre el precio unitario.
  descuento: number;
  impuesto: number;
  // Precio unitario ya con descuento e impuesto aplicados.
  precio_final_unitario: number;
  cantidad: number;
  // precio_final_unitario * cantidad.
  subtotal: number;
}

export class ResponseCarritoDto {
  carrito_id: number;
  items: ResponseCarritoItemDto[];
  total: number;
}
