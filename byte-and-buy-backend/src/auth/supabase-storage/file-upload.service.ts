import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * Servicio para la subida de archivos a Supabase Storage.
 */
@Injectable()
export class FileUploadService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Sube un archivo a un bucket de Supabase Storage.
   * @param file Archivo a subir.
   * @param bucket Nombre del bucket de Supabase.
   * @returns URL pública del archivo subido o null si no hay archivo.
   * @throws Error Si hay un problema al subir el archivo.
   */
  async uploadFile(file: Express.Multer.File | undefined, bucket: string): Promise<string | null> {
    if (!file) return null;

    const fileName = `${Date.now()}_${file.originalname}`;

    const { data, error } = await this.supabaseService.client
      .storage
      .from(bucket)
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(`Error al subir archivo: ${error.message}`);

    const publicData = this.supabaseService.client
      .storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicData.data.publicUrl || null;
  }
}
