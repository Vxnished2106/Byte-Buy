import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductoService } from './producto/producto.service';
import { CategoriaService } from './categoria/categoria.service';
import { EtiquetaService } from './etiqueta/etiqueta.service';
import { ProveedorService } from './proveedor/proveedor.service';
import { InventarioService } from './inventario/inventario.service';
import { ProductoProveedorService } from './producto_proveedor/producto-proveedor.service';
import { ProductoEstado } from './producto/entities/producto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Categoria } from './categoria/entities/categoria.entity';
import { Etiqueta } from './etiqueta/entities/etiqueta.entity';
import { Proveedor } from './proveedor/entities/proveedor.entity';
import { Pais } from './catalogo/entities/pais.entity';
import { Region } from './catalogo/entities/region.entity';
import { Ciudad } from './catalogo/entities/ciudad.entity';

/**
 * Inserta el catálogo geográfico base (países, regiones y ciudades).
 * Es idempotente: no hace nada si ya existen países cargados.
 */
async function seedCatalogos(dataSource: DataSource) {
  const paisRepo = dataSource.getRepository(Pais);
  const regionRepo = dataSource.getRepository(Region);
  const ciudadRepo = dataSource.getRepository(Ciudad);

  if ((await paisRepo.count()) > 0) {
    console.log('Catálogo geográfico ya existe, se omite.');
    return;
  }

  const catalogo: Record<string, Record<string, string[]>> = {
    'Costa Rica|CR': {
      'San José': ['San José', 'Escazú', 'Desamparados'],
      Alajuela: ['Alajuela', 'San Carlos'],
      Cartago: ['Cartago', 'Turrialba'],
    },
    'México|MX': {
      'Ciudad de México': ['Cuauhtémoc', 'Coyoacán', 'Benito Juárez'],
      Jalisco: ['Guadalajara', 'Zapopan'],
    },
  };

  for (const [paisKey, regiones] of Object.entries(catalogo)) {
    const [pais_nombre, pais_codigo] = paisKey.split('|');
    const pais = await paisRepo.save(
      paisRepo.create({ pais_nombre, pais_codigo }),
    );

    for (const [region_nombre, ciudades] of Object.entries(regiones)) {
      const region = await regionRepo.save(
        regionRepo.create({ region_nombre, pais_id: pais.pais_id }),
      );

      await ciudadRepo.save(
        ciudades.map((ciudad_nombre) =>
          ciudadRepo.create({ ciudad_nombre, region_id: region.region_id }),
        ),
      );
    }
  }

  console.log('Catálogo geográfico inicializado correctamente!');
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  await seedCatalogos(app.get(DataSource));

  const categoriaService = app.get(CategoriaService);
  const etiquetaService = app.get(EtiquetaService);
  const productoService = app.get(ProductoService);
  const proveedorService = app.get(ProveedorService);
  const inventarioService = app.get(InventarioService);
  const productoProveedorService = app.get(ProductoProveedorService);

  // 1. Crear categorías
  const categorias = await Promise.all([
    categoriaService.registrarCategoria({ categoria_nombre: 'Electrónica' }),
    categoriaService.registrarCategoria({ categoria_nombre: 'Moda' }),
    categoriaService.registrarCategoria({ categoria_nombre: 'Hogar' }),
    categoriaService.registrarCategoria({ categoria_nombre: 'Deportes' }),
  ]);

  // 2. Crear etiquetas
  const etiquetas = await Promise.all([
    etiquetaService.registrarEtiqueta({ etiqueta_nombre: 'Nuevo' }),
    etiquetaService.registrarEtiqueta({ etiqueta_nombre: 'Oferta' }),
    etiquetaService.registrarEtiqueta({ etiqueta_nombre: 'Popular' }),
  ]);

  // 3. Crear proveedor
  const proveedor = await proveedorService.registrarProveedor({
    proveedor_nombre: 'Tech Supplies Inc.',
    proveedor_correo: 'contacto@techsupplies.com',
    proveedor_telefono: '555-123-4567',
    proveedor_direccion: 'Av. Tecnología 123, Ciudad de México',
  });

  // 4. Crear productos
  const productos = [
    {
      producto_nombre: 'Smartphone X Pro',
      producto_descripcion: 'Smartphone de última generación con pantalla AMOLED de 6.7 pulgadas y cámara de 108MP',
      producto_precio: 1299.99,
      producto_descuento: 15,
      producto_impuesto: 16,
      producto_estado: ProductoEstado.ACTIVO,
      categoria_ids: [categorias[0].categoria_id],
      etiqueta_ids: [etiquetas[0].etiqueta_id, etiquetas[1].etiqueta_id],
      stock_actual: 50,
      stock_minimo: 10,
      precio_compra: 899.99,
    },
    {
      producto_nombre: 'Zapatillas Running Pro',
      producto_descripcion: 'Zapatillas de running con amortiguación avanzada y suela de goma duradera',
      producto_precio: 189.99,
      producto_descuento: 0,
      producto_impuesto: 16,
      producto_estado: ProductoEstado.ACTIVO,
      categoria_ids: [categorias[3].categoria_id],
      etiqueta_ids: [etiquetas[2].etiqueta_id],
      stock_actual: 100,
      stock_minimo: 20,
      precio_compra: 99.99,
    },
    {
      producto_nombre: 'Lámpara de Escritorio LED',
      producto_descripcion: 'Lámpara LED de escritorio con ajuste de intensidad y temperatura de color',
      producto_precio: 59.99,
      producto_descuento: 10,
      producto_impuesto: 16,
      producto_estado: ProductoEstado.ACTIVO,
      categoria_ids: [categorias[2].categoria_id],
      etiqueta_ids: [etiquetas[1].etiqueta_id],
      stock_actual: 200,
      stock_minimo: 30,
      precio_compra: 29.99,
    },
    {
      producto_nombre: 'Audífonos Inalámbricos Noise Cancelling',
      producto_descripcion: 'Audífonos inalámbricos con cancelación de ruido activa y batería de 30 horas',
      producto_precio: 249.99,
      producto_descuento: 20,
      producto_impuesto: 16,
      producto_estado: ProductoEstado.ACTIVO,
      categoria_ids: [categorias[0].categoria_id],
      etiqueta_ids: [etiquetas[0].etiqueta_id, etiquetas[2].etiqueta_id],
      stock_actual: 75,
      stock_minimo: 15,
      precio_compra: 149.99,
    },
    {
      producto_nombre: 'Camiseta Deportiva Premium',
      producto_descripcion: 'Camiseta de tejido transpirable, ideal para entrenamientos de alta intensidad',
      producto_precio: 45.99,
      producto_descuento: 5,
      producto_impuesto: 16,
      producto_estado: ProductoEstado.ACTIVO,
      categoria_ids: [categorias[1].categoria_id],
      etiqueta_ids: [etiquetas[2].etiqueta_id],
      stock_actual: 150,
      stock_minimo: 40,
      precio_compra: 22.99,
    },
    {
      producto_nombre: 'Silla Gamer Ergonómica',
      producto_descripcion: 'Silla ergonómica con soporte lumbar, reposacabezas ajustable y diseño resistente',
      producto_precio: 499.99,
      producto_descuento: 12,
      producto_impuesto: 16,
      producto_estado: ProductoEstado.ACTIVO,
      categoria_ids: [categorias[2].categoria_id],
      etiqueta_ids: [etiquetas[0].etiqueta_id],
      stock_actual: 30,
      stock_minimo: 8,
      precio_compra: 299.99,
    },
    {
      producto_nombre: 'Reloj Inteligente Sport',
      producto_descripcion: 'Reloj inteligente con monitor de frecuencia cardíaca, GPS y resistencia al agua',
      producto_precio: 199.99,
      producto_descuento: 8,
      producto_impuesto: 16,
      producto_estado: ProductoEstado.ACTIVO,
      categoria_ids: [categorias[0].categoria_id],
      etiqueta_ids: [etiquetas[0].etiqueta_id, etiquetas[2].etiqueta_id],
      stock_actual: 60,
      stock_minimo: 12,
      precio_compra: 129.99,
    },
    {
      producto_nombre: 'Pantalones Casuales Slim Fit',
      producto_descripcion: 'Pantalones de tela resistente y corte moderno, perfectos para uso diario',
      producto_precio: 79.99,
      producto_descuento: 0,
      producto_impuesto: 16,
      producto_estado: ProductoEstado.ACTIVO,
      categoria_ids: [categorias[1].categoria_id],
      etiqueta_ids: [etiquetas[2].etiqueta_id],
      stock_actual: 80,
      stock_minimo: 25,
      precio_compra: 39.99,
    },
  ];

  for (const productoData of productos) {
    const producto = await productoService.registrarProducto({
      producto_nombre: productoData.producto_nombre,
      producto_descripcion: productoData.producto_descripcion,
      producto_precio: productoData.producto_precio,
      producto_descuento: productoData.producto_descuento,
      producto_impuesto: productoData.producto_impuesto,
      producto_estado: productoData.producto_estado,
      categoria_ids: productoData.categoria_ids,
      etiqueta_ids: productoData.etiqueta_ids,
    });

    // Crear inventario
    await inventarioService.registrarInventario({
      producto_id: producto.producto_id,
      inventario_stock_actual: productoData.stock_actual,
      inventario_stock_minimo: productoData.stock_minimo,
    });

    // Asignar proveedor
    await productoProveedorService.asignarProveedor({
      producto_id: producto.producto_id,
      proveedor_id: proveedor.proveedor_id,
      producto_proveedor_precio: productoData.precio_compra,
    });
  }

  console.log('Datos inicializados correctamente!');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Error al inicializar datos:', err);
  process.exit(1);
});