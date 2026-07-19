import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ResponseVentaDto } from './dto/response-venta.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

@Controller('ventas')
@UseGuards(SupabaseAuthGuard)
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
    private readonly usuarioService: UsuarioService
  ) { }

  @Post('registrar')
  async registrarVenta(@Request() req: any, @Body() datos: CreateVentaDto): Promise<ResponseVentaDto> {

    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return this.ventaService.registrarVenta({ ...datos, usuario_id: usuario.usuario_id });
    
  }

  @Get(':venta_id')
  async findOne(@Param('venta_id', ParseIntPipe) venta_id: number): Promise<ResponseVentaDto> {
    return this.ventaService.findOne(venta_id);
  }

  @Get('usuario/mis-ventas')
  async findByUsuario(@Request() req: any): Promise<ResponseVentaDto[]> {
    const usuario = await this.usuarioService.getOrCreateFromToken(req.user);
    return this.ventaService.findByUsuario(usuario.usuario_id);
  }

  @Patch(':venta_id')
  async update(
    @Param('venta_id', ParseIntPipe) venta_id: number,
    @Body() datos: UpdateVentaDto,
  ): Promise<ResponseVentaDto> {
    return this.ventaService.update(venta_id, datos);
  }
}
