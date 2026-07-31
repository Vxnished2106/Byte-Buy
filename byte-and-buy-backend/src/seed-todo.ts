import { NestFactory } from '@nestjs/core';
import { DataSource, In } from 'typeorm';
import { AppModule } from './app.module';
import { MetodoPago } from './metodo_pago/entities/metodo_pago.entity';
import { Venta } from './venta/entities/venta.entity';
import { DetalleCompra } from './detalle_compra/entities/detalle_compra.entity';
import { Pago } from './pago/entities/pago.entity';
import { Factura } from './factura/entities/factura.entity';
import { TokenRecuperacion } from './token_recuperacion/entities/token_recuperacion.entity';
import { RegistroActividad } from './usuario/entities/registro-actividad.entity';
import { Usuario } from './usuario/entities/usuario.entity';
import { Producto } from './producto/entities/producto.entity';

/**
 * Seed general: llena las tablas transaccionales que quedaban vacías
 * (metodo_pago, venta, detalle_compra, pago, factura, registro_actividad,
 * token_recuperacion) con datos enlazados y coherentes entre sí.
 *
 * Idempotente por tabla: cada bloque solo inserta si la tabla está vacía, así
 * que se puede reejecutar sin duplicar.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const usuarioRepo = ds.getRepository(Usuario);
  const productoRepo = ds.getRepository(Producto);
  const metodoRepo = ds.getRepository(MetodoPago);
  const ventaRepo = ds.getRepository(Venta);
  const detalleRepo = ds.getRepository(DetalleCompra);
  const pagoRepo = ds.getRepository(Pago);
  const facturaRepo = ds.getRepository(Factura);
  const registroRepo = ds.getRepository(RegistroActividad);
  const tokenRepo = ds.getRepository(TokenRecuperacion);

  const cliente =
    (await usuarioRepo.findOneBy({ usuario_correo: 'arrietafabian38@gmail.com' })) ??
    (await usuarioRepo.find({ take: 1 }))[0];
  if (!cliente) {
    console.log('No hay usuarios; no se puede sembrar.');
    await app.close();
    return;
  }
  const usuario_id = cliente.usuario_id;

  // --- 1. Métodos de pago (catálogo) ----------------------------------------
  let metodos = await metodoRepo.find();
  if (metodos.length === 0) {
    metodos = await metodoRepo.save(
      ['Tarjeta de crédito', 'Tarjeta de débito', 'Efectivo', 'Transferencia', 'SINPE Móvil'].map(
        (nombre) => metodoRepo.create({ metodo_pago_nombre: nombre }),
      ),
    );
    console.log(`metodo_pago: ${metodos.length} insertados.`);
  }

  // Precios reales del catálogo para armar detalles coherentes.
  const productos = await productoRepo.findBy({ producto_id: In([1, 3, 4, 5]) });
  const precio = (id: number) =>
    Number(productos.find((p) => p.producto_id === id)?.producto_precio ?? 0);

  // --- 2. Ventas + detalle_compra + pago + factura --------------------------
  if ((await ventaRepo.count()) === 0) {
    // Definición de las compras a sembrar (producto_id + cantidad por línea).
    const compras = [
      { lineas: [{ p: 3, c: 2 }, { p: 4, c: 2 }], facturar: true, enviada: true },
      { lineas: [{ p: 1, c: 1 }], facturar: false, enviada: false },
      { lineas: [{ p: 5, c: 1 }, { p: 3, c: 1 }], facturar: true, enviada: false },
    ];

    let nFactura = 1;
    for (let i = 0; i < compras.length; i++) {
      const compra = compras[i];
      const monto = compra.lineas.reduce((acc, l) => acc + precio(l.p) * l.c, 0);

      const venta = await ventaRepo.save(
        ventaRepo.create({
          venta_monto: monto,
          venta_estado: 'aprobado',
          usuario_id,
          carrito_id: null,
        }),
      );

      await detalleRepo.save(
        compra.lineas.map((l) => {
          const sub = precio(l.p) * l.c;
          return detalleRepo.create({
            venta_id: venta.venta_id,
            producto_id: l.p,
            detalle_compra_cantidad: l.c,
            detalle_compra_precio_unitario: precio(l.p),
            detalle_compra_descuento: 0,
            detalle_compra_impuesto: 0,
            detalle_compra_subtotal: sub,
            detalle_compra_total: sub,
          });
        }),
      );

      const pago = await pagoRepo.save(
        pagoRepo.create({
          venta_id: venta.venta_id,
          metodo_pago_id: metodos[i % metodos.length].metodo_pago_id,
          pago_monto: monto,
          pago_estado: 'aprobado',
        }),
      );

      if (compra.facturar) {
        await facturaRepo.save(
          facturaRepo.create({
            venta_id: venta.venta_id,
            pago_id: pago.pago_id,
            factura_numero: `FAC-${String(nFactura++).padStart(6, '0')}`,
            factura_monto_total: monto,
            factura_estado: 'pagada',
            factura_enviada: compra.enviada,
            factura_fecha_enviada: compra.enviada ? new Date() : null,
          }),
        );
      }
    }
    console.log('venta, detalle_compra, pago y factura sembrados.');
  }

  // --- 3. Registro de actividad ---------------------------------------------
  if ((await registroRepo.count()) === 0) {
    await registroRepo.save([
      registroRepo.create({
        usuario_id,
        tipo_actividad: 'INICIO_SESION',
        campos_actualizados: { ip: '127.0.0.1', navegador: 'Chrome' },
      }),
      registroRepo.create({
        usuario_id,
        tipo_actividad: 'ACTUALIZAR_PERFIL',
        campos_actualizados: { usuario_nombre: 'Fabián' },
      }),
      registroRepo.create({
        usuario_id,
        tipo_actividad: 'CREAR_PEDIDO',
        campos_actualizados: { pedido_numero: 'PED-000002' },
      }),
    ]);
    console.log('registro_actividad sembrado.');
  }

  // --- 4. Token de recuperación (ya usado/expirado: inerte) -----------------
  if ((await tokenRepo.count()) === 0) {
    await tokenRepo.save(
      tokenRepo.create({
        usuario_id,
        token: '123456',
        intentos: 0,
        expira: new Date(Date.now() - 24 * 60 * 60 * 1000), // ayer
        usado_en: new Date(Date.now() - 25 * 60 * 60 * 1000), // ya usado
      }),
    );
    console.log('token_recuperacion sembrado (inerte).');
  }

  console.log('Seed general completado.');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error en el seed general:', err);
  process.exit(1);
});
