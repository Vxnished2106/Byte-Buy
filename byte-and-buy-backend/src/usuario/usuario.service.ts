import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, Rol } from './entities/usuario.entity';
import { RegistroActividad } from './entities/registro-actividad.entity';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { SupabaseAuthService } from '../auth/supabase-auth/auth-password.service';
import { FileUploadService } from '../auth/supabase-storage/file-upload.service';
import { SupabaseService } from '../auth/supabase-storage/supabase.service';
import { TokenRecuperacionService } from '../token_recuperacion/token_recuperacion.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RegistroActividad)
    private readonly registroActividadRepository: Repository<RegistroActividad>,
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly fileUploadService: FileUploadService,
    private readonly supabaseService: SupabaseService,
    private readonly tokenRecuperacionService: TokenRecuperacionService,
    private readonly mailService: MailService,
  ) { }

  // ─── DTO mapping ───────────────────────────────────────────────

  /**
   * Mapea una entidad Usuario a su DTO de respuesta.
   * @param usuario Entidad usuario.
   * @returns DTO de respuesta.
   */
  private toResponseDto(usuario: Usuario): ResponseUsuarioDto {
    return {
      usuario_id: usuario.usuario_id,
      usuario_nombre: usuario.usuario_nombre,
      usuario_apellido1: usuario.usuario_apellido1,
      usuario_apellido2: usuario.usuario_apellido2,
      usuario_correo: usuario.usuario_correo,
      usuario_rol: usuario.usuario_rol,
      supabase_id: usuario.supabase_id,
      usuario_foto: usuario.usuario_foto,
    };
  }

  // ─── Consultas ─────────────────────────────────────────────────

  /**
   * Obtiene un usuario por su ID.
   * @param usuarioId ID del usuario.
   * @returns DTO del usuario.
   */
  async findOne(usuarioId: number): Promise<ResponseUsuarioDto> {
    const usuario = await this.findEntityById(usuarioId);
    return this.toResponseDto(usuario);
  }

  /**
   * Busca la entidad de un usuario por su ID.
   * @param usuarioId ID del usuario.
   * @returns Entidad Usuario.
   * @throws NotFoundException si el usuario no existe.
   */
  async findEntityById(usuarioId: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_id: usuarioId },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  /**
   * Busca un usuario por su correo electrónico.
   * @param correo Correo a buscar.
   * @returns Entidad Usuario o null si no existe.
   */
  async findByCorreo(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { usuario_correo: correo } });
  }

  /**
   * Busca un usuario por su ID de Supabase.
   * @param supabaseId ID de Supabase.
   * @returns DTO del usuario o null si no existe.
   */
  async findBySupabaseId(supabaseId: string): Promise<ResponseUsuarioDto | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { supabase_id: supabaseId },
    });
    return usuario ? this.toResponseDto(usuario) : null;
  }

  /**
   * Obtiene los datos del usuario autenticado.
   * @param user Datos del usuario del token.
   * @returns DTO del usuario.
   */
  async obtenerPerfilAutenticado(user: any): Promise<ResponseUsuarioDto> {
    return this.getOrCreateFromToken(user);
  }



  /**
   * Crea o retorna un usuario proveniente de Supabase.
   * @param user Datos del usuario de Supabase.
   * @returns Usuario en formato DTO.
   */
  async createFromSupabase(user: {
    email: string;
    userId: string;
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    foto?: string | null;
  }): Promise<ResponseUsuarioDto> {
    const existente = await this.usuarioRepository.findOne({ where: { supabase_id: user.userId } });
    if (existente) return this.toResponseDto(existente);

    const nuevoUsuario = this.usuarioRepository.create({
      usuario_correo: user.email,
      supabase_id: user.userId,
      usuario_nombre: user.nombre ?? '',
      usuario_apellido1: user.apellido1 ?? '',
      usuario_apellido2: user.apellido2 ?? null,
      usuario_foto: user.foto ?? null,
      usuario_contrasena: '',
      usuario_rol: Rol.CLIENTE,
    });

    const guardado = await this.usuarioRepository.save(nuevoUsuario);
    return this.toResponseDto(guardado);
  }

  // ─── Actualizar ────────────────────────────────────────────────

  /**
   * Registra una actividad en el historial de auditoría.
   * @param usuarioId ID del usuario.
   * @param tipoActividad Tipo de actividad.
   * @param camposActualizados Campos que se actualizaron.
   */
  private async registrarActividad(
    usuarioId: number,
    tipoActividad: string,
    camposActualizados: any,
  ): Promise<void> {
    const registro = this.registroActividadRepository.create({
      usuario_id: usuarioId,
      tipo_actividad: tipoActividad,
      campos_actualizados: camposActualizados,
    });
    await this.registroActividadRepository.save(registro);
  }

  /**
   * Actualiza la información de un usuario.
   * @param usuarioId ID del usuario.
   * @param datos Nuevos datos.
   * @param file (Opcional) Nueva foto de perfil.
   * @returns Usuario actualizado en formato DTO.
   */
  async update(usuarioId: number, datos: UpdateUsuarioDto, file?: Express.Multer.File): Promise<ResponseUsuarioDto> {
    const usuario = await this.findEntityById(usuarioId);

    // Guardar datos originales para auditoría
    const datosOriginales = {
      usuario_nombre: usuario.usuario_nombre,
      usuario_apellido1: usuario.usuario_apellido1,
      usuario_apellido2: usuario.usuario_apellido2,
      usuario_correo: usuario.usuario_correo,
      usuario_foto: usuario.usuario_foto,
    };

    // No permitir cambiar correo a uno ya existente
    if (datos.usuario_correo && datos.usuario_correo !== usuario.usuario_correo) {
      const existe = await this.usuarioRepository.findOne({ where: { usuario_correo: datos.usuario_correo } });
      if (existe) throw new ConflictException('El correo ya está registrado');
    }

    if (file) {
      datos.usuario_foto = await this.fileUploadService.uploadFile(file, 'usuario');
    }

    Object.assign(usuario, datos);
    const guardado = await this.usuarioRepository.save(usuario);

    // Registrar cambios para auditoría
    const cambios: any = {};
    for (const key in datos) {
      if (datos[key as keyof typeof datos] !== datosOriginales[key as keyof typeof datosOriginales]) {
        cambios[key] = {
          antes: datosOriginales[key as keyof typeof datosOriginales],
          despues: datos[key as keyof typeof datos],
        };
      }
    }

    if (Object.keys(cambios).length > 0) {
      await this.registrarActividad(usuarioId, 'actualizacion_perfil', cambios);
    }

    return this.toResponseDto(guardado);
  }

  /**
   * Cambia la contraseña de un usuario en Supabase.
   * @param usuarioId ID del usuario.
   * @param contrasenaActual Contraseña actual para validar.
   * @param contrasenaNueva Nueva contraseña.
   */
  async cambiarContrasena(usuarioId: number, contrasenaActual: string, contrasenaNueva: string): Promise<void> {
    const usuario = await this.findEntityById(usuarioId);
    if (!usuario.supabase_id) throw new BadRequestException('Usuario no tiene ID de Supabase asociado');

    // Primero validamos la contraseña actual con Supabase
    const { error } = await this.supabaseService.client.auth.signInWithPassword({
      email: usuario.usuario_correo,
      password: contrasenaActual,
    });
    
    if (error) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Si es válida, cambiamos la contraseña
    await this.supabaseAuthService.cambiarContrasena(usuario.supabase_id, contrasenaNueva);
  }

  /**
   * Inicia el proceso de recuperación de contraseña enviando un PIN al correo.
   * @param email Correo del usuario.
   */
  async solicitarRecuperacion(email: string): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_correo: email },
    });

    // No revelar si existe o no por seguridad
    if (!usuario) return;

    // 1. Generar y guardar PIN en nuestra DB local
    const token = await this.tokenRecuperacionService.create(
      usuario.usuario_id,
    );

    // 2. Enviar el código por email usando nuestro MailService local (Nodemailer)
    try {
      await this.mailService.enviarCodigo(email, token.token);
    } catch (error) {
      console.error('Error enviando email de recuperación:', error);
      throw new BadRequestException('No se pudo enviar el correo de recuperación');
    }
  }

  /**
   * Confirma la recuperación de contraseña validando el PIN y actualizando en Supabase.
   * @param email Correo del usuario.
   * @param codigo PIN de recuperación.
   * @param nuevaContrasena Nueva contraseña.
   * @throws BadRequestException si hay errores en la validación o actualización.
   */
  async confirmarRecuperacion(
    email: string,
    codigo: string,
    nuevaContrasena: string,
  ): Promise<void> {
    // 1. Buscar usuario activo
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_correo: email },
    });

    if (!usuario || !usuario.supabase_id) {
      throw new BadRequestException('Usuario no encontrado o no vinculado a Supabase');
    }

    // 2. Validar el PIN contra nuestra base de datos local
    const tokenRecord = await this.tokenRecuperacionService.validarPin(
      codigo,
      usuario.usuario_id,
    );

    // 3. Si el PIN es válido, actualizar la contraseña en Supabase usando el Service Role
    try {
      await this.supabaseAuthService.cambiarContrasena(
        usuario.supabase_id,
        nuevaContrasena,
      );
      
      // 4. Marcar el PIN como usado solo si el cambio en Supabase fue exitoso
      await this.tokenRecuperacionService.marcarComoUsado(tokenRecord);
    } catch (error) {
      console.error('Error al actualizar contraseña en Supabase:', error);
      throw new BadRequestException(error.message || 'Error al actualizar la contraseña');
    }
  }

  // ─── Autenticación ─────────────────────────────────────────────

  /**
   * Obtiene un usuario existente por su token o lo crea si no existe (proveniente de Supabase).
   * @param user Datos del usuario del token.
   * @returns DTO del usuario.
   */
  async getOrCreateFromToken(user: any) {
    let usuario = await this.findBySupabaseId(user.userId);

    if (!usuario) {
      const userMetadata = (user.user_metadata as any) || {};
      usuario = await this.createFromSupabase({
        email: user.email,
        userId: user.userId,
        nombre: userMetadata.nombre || userMetadata.full_name || '',
        apellido1: userMetadata.apellido1 || userMetadata.apellido || '',
        apellido2: userMetadata.apellido2 || null,
        foto: userMetadata.foto || userMetadata.avatar_url || null,
      });
    }

    return usuario;
  }
}
