/** Dirección de envío del usuario (`ResponseDireccionEnvioDto` del backend). */
export interface DireccionEnvio {
  direccion_envio_id: number;
  usuario_id: number;
  ciudad_id: number;
  direccion_destinatario: string;
  direccion_telefono: string;
  direccion_calle: string;
  direccion_referencia: string | null;
  direccion_codigo_postal: string | null;
  direccion_fecha_creacion: string;
}

/** Datos enviados al backend para crear una dirección de envío (`CreateDireccionEnvioDto`). */
export interface CreateDireccionEnvio {
  ciudad_id: number;
  direccion_destinatario: string;
  direccion_telefono: string;
  direccion_calle: string;
  direccion_referencia?: string;
  direccion_codigo_postal?: string;
}
