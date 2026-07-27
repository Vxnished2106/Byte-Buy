import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { MailModule } from './mail/mail.module';
import { TokenRecuperacionModule } from './token_recuperacion/token_recuperacion.module';
import { CategoriaModule } from './categoria/categoria.module';
import { EtiquetaModule } from './etiqueta/etiqueta.module';
import { ProductoModule } from './producto/producto.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { InventarioModule } from './inventario/inventario.module';
import { ProductoProveedorModule } from './producto_proveedor/producto_proveedor.module';
import { CarritoModule } from './carrito/carrito.module';
import { PagoModule } from './pago/pago.module';
import { VentaModule } from './venta/venta.module';
import { MetodoPagoModule } from './metodo_pago/metodo_pago.module';
import { FacturaModule } from './factura/factura.module';
import { DetalleCompraModule } from './detalle_compra/detalle_compra.module';

/**
 * Módulo principal de la aplicación NestJS.
 * Configura la conexión a la base de datos MySQL, importa todos los módulos de funcionalidad,
 * y configura módulos globales como ConfigModule y ScheduleModule.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        charset: 'utf8mb4',
      }),
    }),
    AuthModule,
    UsuarioModule,
    MailModule,
    TokenRecuperacionModule,
    CategoriaModule,
    EtiquetaModule,
    ProductoModule,
    ProveedorModule,
    InventarioModule,
    ProductoProveedorModule,
    CarritoModule,
    PagoModule,
    VentaModule,
    MetodoPagoModule,
    FacturaModule,
    DetalleCompraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
