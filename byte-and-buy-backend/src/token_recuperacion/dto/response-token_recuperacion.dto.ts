export class ResponseTokenRecuperacionDto {
  id: number;
  usuario_id: number;
  expira: Date;
  usado_en: Date | null;
  registro: Date;
  token: string;
}
