import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle_pedido.entity';
import { PedidoHistorialEstado } from './entities/pedido_historial_estado.entity';
import { DireccionEnvio } from '../direccion_envio/entities/direccion_envio.entity';
import { Producto } from '../producto/entities/producto.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Inventario } from '../inventario/entities/inventario.entity';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';
import { UsuarioModule } from '../usuario/usuario.module';

/**
 * Módulo de pedidos.
 * Contiene el flujo completo: creación, edición, listado paginado, detalle y
 * transiciones de estado con control de inventario.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      DetallePedido,
      PedidoHistorialEstado,
      DireccionEnvio,
      Producto,
      Usuario,
      Inventario,
    ]),
    UsuarioModule,
  ],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService],
})
export class PedidoModule {}
