import { Controller, Get, Post, Param, Body, ParseIntPipe, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { EtiquetaService } from './etiqueta.service';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { ResponseEtiquetaDto } from './dto/response-etiqueta.dto';
import { AsignarEtiquetaDto } from './dto/asignar-etiqueta.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { UsuarioService } from '../usuario/usuario.service';
import { Rol } from '../usuario/entities/usuario.entity';

@Controller('etiquetas')
export class EtiquetaController {
  constructor(
    private readonly etiquetaService: EtiquetaService,
    private readonly usuarioService: UsuarioService,
  ) { }

  private async validarAdmin(req: any): Promise<void> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);

    if (usuario.usuario_rol !== Rol.ADMIN) {
      throw new ForbiddenException(
        'No tiene permisos para realizar esta acción',
      );
    }
  }

  @Get()
  async mostrarEtiquetas(): Promise<ResponseEtiquetaDto[]> {
    return this.etiquetaService.mostrarEtiquetas();
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('registrar')
  async registrarEtiqueta(
    @Request() req: any,
    @Body() datos: CreateEtiquetaDto): Promise<ResponseEtiquetaDto> {
    await this.validarAdmin(req);
    return this.etiquetaService.registrarEtiqueta(datos);
  }
}
