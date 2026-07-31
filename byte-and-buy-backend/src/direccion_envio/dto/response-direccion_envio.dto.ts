/**
 * DTO de respuesta para una dirección de envío.
 */
export class ResponseDireccionEnvioDto {
  /** ID único de la dirección de envío. */
  direccion_envio_id: number;

  /** ID del usuario dueño de la dirección. */
  usuario_id: number;

  /** ID de la ciudad de la dirección. */
  ciudad_id: number;

  /** Nombre de quien recibe el pedido. */
  direccion_destinatario: string;

  /** Teléfono de contacto para la entrega. */
  direccion_telefono: string;

  /** Calle y número de la dirección. */
  direccion_calle: string;

  /** Referencia adicional para ubicar la dirección (opcional). */
  direccion_referencia: string | null;

  /** Código postal (opcional). */
  direccion_codigo_postal: string | null;

  /** Fecha en la que se registró la dirección. */
  direccion_fecha_creacion: Date;
}
