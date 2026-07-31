import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { PedidoService, ActorPedido } from './pedido/pedido.service';
import { PedidoEstado } from './pedido/entities/pedido.entity';
import { Pais } from './catalogo/entities/pais.entity';
import { Region } from './catalogo/entities/region.entity';
import { Ciudad } from './catalogo/entities/ciudad.entity';
import { DireccionEnvio } from './direccion_envio/entities/direccion_envio.entity';
import { Usuario, Rol } from './usuario/entities/usuario.entity';

/**
 * Seed de datos de demostración para el módulo de Pedidos.
 *
 * Crea, para un usuario cliente, un pedido en cada estado del flujo
 * (BORRADOR, CONFIRMADO, EN_PREPARACION, ENTREGADO, CANCELADO). Pasa por el
 * `PedidoService` real, de modo que se generan el historial de estados y los
 * movimientos de inventario tal como en producción.
 *
 * Es idempotente: si el usuario ya tiene pedidos, no hace nada.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const pedidoService = app.get(PedidoService);

  const usuarioRepo = dataSource.getRepository(Usuario);
  const paisRepo = dataSource.getRepository(Pais);
  const regionRepo = dataSource.getRepository(Region);
  const ciudadRepo = dataSource.getRepository(Ciudad);
  const direccionRepo = dataSource.getRepository(DireccionEnvio);

  // Cliente objetivo: la cuenta de prueba (o el primer usuario que exista).
  const cliente =
    (await usuarioRepo.findOneBy({
      usuario_correo: 'arrietafabian38@gmail.com',
    })) ?? (await usuarioRepo.find({ take: 1 }))[0];

  if (!cliente) {
    console.log('No hay usuarios en la BD; no se puede sembrar pedidos.');
    await app.close();
    return;
  }

  const actor: ActorPedido = {
    usuario_id: cliente.usuario_id,
    usuario_rol: cliente.usuario_rol ?? Rol.CLIENTE,
  };

  const yaTiene = await dataSource
    .getRepository('pedido')
    .createQueryBuilder('p')
    .where('p.cliente_id = :id', { id: cliente.usuario_id })
    .getCount();
  if (yaTiene > 0) {
    console.log(
      `El usuario ${cliente.usuario_id} ya tiene ${yaTiene} pedido(s); se omite el seed.`,
    );
    await app.close();
    return;
  }

  // 1. Catálogo mínimo (idempotente).
  let pais = await paisRepo.findOne({ where: {}, order: { pais_id: 'ASC' } });
  if (!pais) {
    pais = await paisRepo.save(
      paisRepo.create({ pais_nombre: 'Costa Rica', pais_codigo: 'CR' }),
    );
  }
  let region = await regionRepo.findOne({ where: { pais_id: pais.pais_id } });
  if (!region) {
    region = await regionRepo.save(
      regionRepo.create({ region_nombre: 'San José', pais_id: pais.pais_id }),
    );
  }
  let ciudad = await ciudadRepo.findOne({ where: { region_id: region.region_id } });
  if (!ciudad) {
    ciudad = await ciudadRepo.save(
      ciudadRepo.create({ ciudad_nombre: 'San José', region_id: region.region_id }),
    );
  }

  // 2. Dirección de envío para el cliente (idempotente).
  let direccion = await direccionRepo.findOne({
    where: { usuario_id: cliente.usuario_id },
  });
  if (!direccion) {
    direccion = await direccionRepo.save(
      direccionRepo.create({
        usuario_id: cliente.usuario_id,
        ciudad_id: ciudad.ciudad_id,
        direccion_destinatario: `${cliente.usuario_nombre} ${cliente.usuario_apellido1}`,
        direccion_telefono: '8888-8888',
        direccion_calle: 'Av. Central 100',
        direccion_referencia: 'Casa azul, portón negro',
        direccion_codigo_postal: '10101',
      }),
    );
  }
  const direccion_envio_id = direccion.direccion_envio_id;

  // 3. Pedidos de demo, uno por estado del flujo.
  //    Productos usados (existen por el seed general): 1,3,4,5.
  const avanzar = async (pedidoId: number, version: number, estado: PedidoEstado) => {
    const r = await pedidoService.cambiarEstado(
      pedidoId,
      { nuevo_estado: estado, pedido_version: version, nota: `Demo: ${estado}` },
      actor,
    );
    return r.pedido_version;
  };

  // A) BORRADOR (sin avanzar).
  await pedidoService.crear(
    {
      cliente_id: cliente.usuario_id,
      direccion_envio_id,
      pedido_notas: 'Pedido de ejemplo en borrador',
      items: [
        { producto_id: 3, cantidad: 2 },
        { producto_id: 4, cantidad: 1 },
      ],
    },
    actor,
  );

  // B) CONFIRMADO (descuenta stock).
  const b = await pedidoService.crear(
    {
      cliente_id: cliente.usuario_id,
      direccion_envio_id,
      items: [{ producto_id: 1, cantidad: 1 }],
    },
    actor,
  );
  await avanzar(b.pedido_id, b.pedido_version, PedidoEstado.CONFIRMADO);

  // C) ENTREGADO (recorre todo el flujo).
  const c = await pedidoService.crear(
    {
      cliente_id: cliente.usuario_id,
      direccion_envio_id,
      items: [{ producto_id: 5, cantidad: 1 }],
    },
    actor,
  );
  let vc = await avanzar(c.pedido_id, c.pedido_version, PedidoEstado.CONFIRMADO);
  vc = await avanzar(c.pedido_id, vc, PedidoEstado.EN_PREPARACION);
  await avanzar(c.pedido_id, vc, PedidoEstado.ENTREGADO);

  // D) CANCELADO desde CONFIRMADO (repone stock).
  const d = await pedidoService.crear(
    {
      cliente_id: cliente.usuario_id,
      direccion_envio_id,
      items: [{ producto_id: 4, cantidad: 3 }],
    },
    actor,
  );
  const vd = await avanzar(d.pedido_id, d.pedido_version, PedidoEstado.CONFIRMADO);
  await avanzar(d.pedido_id, vd, PedidoEstado.CANCELADO);

  console.log(
    `Pedidos de demo creados para el usuario ${cliente.usuario_id} (BORRADOR, CONFIRMADO, ENTREGADO, CANCELADO).`,
  );
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error al sembrar pedidos:', err);
  process.exit(1);
});
