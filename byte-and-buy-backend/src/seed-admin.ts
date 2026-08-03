import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SupabaseAuthService } from './auth/supabase-auth/auth-password.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, Rol } from './usuario/entities/usuario.entity';

/**
 * Script para crear un usuario administrador en Supabase Auth y MySQL
 * con rol ADMIN. Ejecutar con: pnpm seed:admin
 */

// Datos del usuario administrador por defecto
const ADMIN_DATA = {
  nombre: 'Admin',
  apellido1: 'ByteBuy',
  apellido2: null as string | null,
  correo: 'admin@bytebuy.com',
  contrasena: 'Admin123!',
};

class AdminSeeder {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async run() {
    console.log('\n========================================');
    console.log('  Creando usuario administrador...');
    console.log('========================================\n');

    // Verificar si ya existe en MySQL
    const existenteLocal = await this.usuarioRepository.findOne({
      where: { usuario_correo: ADMIN_DATA.correo },
    });

    if (existenteLocal) {
      console.log(`ℹ️  Ya existe un usuario con el correo ${ADMIN_DATA.correo} en MySQL.`);
      if (existenteLocal.usuario_rol !== Rol.ADMIN) {
        console.log(`🔄 Actualizando rol a ADMIN...`);
        existenteLocal.usuario_rol = Rol.ADMIN;
        await this.usuarioRepository.save(existenteLocal);
        console.log(`✅ Rol actualizado a ADMIN correctamente.`);
      } else {
        console.log(`✅ El usuario ya tiene rol ADMIN.`);
      }
      this.imprimirCredenciales();
      return;
    }

    // 1. Crear en Supabase Auth
    console.log('1️⃣  Creando usuario en Supabase Auth...');
    const supabaseUser = await this.supabaseAuthService.registrar({
      email: ADMIN_DATA.correo,
      password: ADMIN_DATA.contrasena,
      nombre: ADMIN_DATA.nombre,
      apellido1: ADMIN_DATA.apellido1,
      apellido2: ADMIN_DATA.apellido2,
    });
    console.log(`   ✅ Usuario Supabase creado: ID ${supabaseUser.id}`);

    // 2. Crear en MySQL con rol ADMIN
    console.log('2️⃣  Creando usuario en MySQL con rol ADMIN...');
    const nuevoAdmin = this.usuarioRepository.create({
      usuario_correo: ADMIN_DATA.correo,
      supabase_id: supabaseUser.id,
      usuario_nombre: ADMIN_DATA.nombre,
      usuario_apellido1: ADMIN_DATA.apellido1,
      usuario_apellido2: ADMIN_DATA.apellido2,
      usuario_contrasena: '',
      usuario_rol: Rol.ADMIN,
      usuario_foto: null,
    });

    const guardado = await this.usuarioRepository.save(nuevoAdmin);
    console.log(`   ✅ Usuario MySQL creado: ID ${guardado.usuario_id} (${guardado.usuario_rol})`);

    console.log('\n========================================');
    console.log('  ✅ USUARIO ADMIN CREADO EXITOSAMENTE');
    console.log('========================================\n');
    this.imprimirCredenciales();
  }

  private imprimirCredenciales() {
    console.log('📋 Credenciales de acceso:');
    console.log('   📧 Correo:      ' + ADMIN_DATA.correo);
    console.log('   🔑 Contraseña:  ' + ADMIN_DATA.contrasena);
    console.log('   👤 Rol:         ADMIN');
    console.log('');
    console.log('🔗 URL de acceso admin:');
    console.log('   http://localhost:5173/byte&buy/admin');
    console.log('');
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const supabaseAuthService = app.get(SupabaseAuthService);
  const usuarioRepository = app.get('UsuarioRepository');
  const seeder = new AdminSeeder(supabaseAuthService, usuarioRepository as Repository<Usuario>);
  try {
    await seeder.run();
  } catch (err: any) {
    console.error('\n❌ Error creando usuario admin:', err.message || err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
