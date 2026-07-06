import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class FileUploadService {
  constructor(private readonly supabaseService: SupabaseService) {}

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
