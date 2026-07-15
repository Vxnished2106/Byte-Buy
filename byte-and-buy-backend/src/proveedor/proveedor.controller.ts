import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';

import { ProveedorService } from './proveedor.service';

import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { ResponseProveedorDto } from './dto/response-proveedor.dto';

import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { UsuarioService } from '../usuario/usuario.service';
import { Rol } from '../usuario/entities/usuario.entity';
import { ProveedorEstado } from './entities/proveedor.entity';


@Controller('proveedores')
export class ProveedorController {


  constructor(
    private readonly proveedorService: ProveedorService,
    private readonly usuarioService: UsuarioService,
  ) {}



  private async validarAdmin(
    req: any,
  ): Promise<void> {


    const usuario =
      await this.usuarioService
        .getOrCreateFromToken(
          req.user,
        );


    if (
      usuario.usuario_rol !==
      Rol.ADMIN
    ) {

      throw new ForbiddenException(
        'No tiene permisos para realizar esta acción',
      );

    }

  }



  /**
   * Registrar proveedor
   *
   * POST /proveedores
   *
   * Solo administrador
   */
  @UseGuards(SupabaseAuthGuard)
  @Post()
  async registrarProveedor(
    @Request() req: any,

    @Body()
    datos: CreateProveedorDto,

  ): Promise<ResponseProveedorDto> {


    await this.validarAdmin(
      req,
    );


    return this.proveedorService
      .registrarProveedor(
        datos,
      );

  }




  /**
   * Listar proveedores
   *
   * GET /proveedores
   *
   * Filtros:
   *
   * /proveedores?nombre=empresa
   *
   * /proveedores?estado=activo
   */
  @UseGuards(SupabaseAuthGuard)
  @Get()
  async mostrarProveedores(
    @Request() req: any,

    @Query('nombre')
    nombre?: string,

    @Query('estado')
    estado?: ProveedorEstado,

  ): Promise<ResponseProveedorDto[]> {


    await this.validarAdmin(
      req,
    );


    return this.proveedorService
      .mostrarProveedores(
        nombre,
        estado,
      );

  }





  /**
   * Editar proveedor
   *
   * PATCH /proveedores/:id
   *
   * Solo administrador
   */
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async editarProveedor(

    @Request()
    req: any,


    @Param(
      'id',
      ParseIntPipe,
    )
    proveedor_id: number,


    @Body()
    datos: Partial<CreateProveedorDto>,


  ): Promise<ResponseProveedorDto> {


    await this.validarAdmin(
      req,
    );


    return this.proveedorService
      .editarProveedor(
        proveedor_id,
        datos,
      );

  }





  /**
   * Activar / desactivar proveedor
   *
   * PATCH /proveedores/:id/estado
   *
   * Solo administrador
   */
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/estado')
  async cambiarEstadoProveedor(

    @Request()
    req: any,


    @Param(
      'id',
      ParseIntPipe,
    )
    proveedor_id: number,


  ): Promise<ResponseProveedorDto> {


    await this.validarAdmin(
      req,
    );


    return this.proveedorService
      .cambiarEstadoProveedor(
        proveedor_id,
      );

  }

}