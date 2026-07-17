import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { CarritoService } from './carrito.service';
import { UsuarioService } from '../usuario/usuario.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { AgregarItemDto } from './dto/agregar-item.dto';
import { ActualizarItemDto } from './dto/actualizar-item.dto';

@Controller('carrito')
@UseGuards(SupabaseAuthGuard)
export class CarritoController {
  constructor(
    private readonly carritoService: CarritoService,
    private readonly usuarioService: UsuarioService,
  ) {}

  /** Resuelve el usuario de BD a partir del token de Supabase. */
  private async obtenerUsuarioId(req: any): Promise<number> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return usuario.usuario_id;
  }

  @Get()
  async obtenerCarrito(@Request() req: any) {
    return this.carritoService.obtenerCarritoConSubtotales(
      await this.obtenerUsuarioId(req),
    );
  }

  @Post('items')
  async agregarItem(
    @Request() req: any,
    @Body() dto: AgregarItemDto,
  ) {
    return this.carritoService.agregarItem(
      await this.obtenerUsuarioId(req),
      dto,
    );
  }

  @Put('items/:producto_id')
  async actualizarItem(
    @Request() req: any,
    @Param('producto_id', ParseIntPipe) producto_id: number,
    @Body() dto: ActualizarItemDto,
  ) {
    return this.carritoService.actualizarCantidad(
      await this.obtenerUsuarioId(req),
      producto_id,
      dto,
    );
  }

  @Delete('items/:producto_id')
  async eliminarItem(
    @Request() req: any,
    @Param('producto_id', ParseIntPipe) producto_id: number,
  ) {
    return this.carritoService.eliminarItem(
      await this.obtenerUsuarioId(req),
      producto_id,
    );
  }
}
