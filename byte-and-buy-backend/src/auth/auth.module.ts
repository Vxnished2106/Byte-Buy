import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseAuthGuard } from './supabase-auth/supabase-auth.guard';
import { SupabaseService } from './supabase-storage/supabase.service';
import { FileUploadService } from './supabase-storage/file-upload.service';
import { SupabaseAuthService } from './supabase-auth/auth-password.service';

@Module({
  imports: [ConfigModule],
  providers: [
    SupabaseAuthGuard,
    SupabaseService,
    FileUploadService,
    SupabaseAuthService,
  ],
  exports: [
    SupabaseAuthGuard,
    SupabaseService,
    FileUploadService,
    SupabaseAuthService,
  ],
})
export class AuthModule {}
