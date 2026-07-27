import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Factura } from './entities/factura.entity';

@Injectable()
export class PdfFacturaService {
  async generarPdf(factura: Factura): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    const pdfBuffer = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    const venta = factura.venta;
    const usuario = venta.usuario;
    const detalles = venta.detallesCompra;

    const nombreCompleto = [
      usuario.usuario_nombre,
      usuario.usuario_apellido1,
      usuario.usuario_apellido2,
    ].filter(Boolean).join(' ');

    // Encabezado
    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('BYTE & BUY', { align: 'center' });

    doc
      .fontSize(16)
      .text('Factura de Compra', { align: 'center' });

    doc.moveDown();

    // Información de la factura
    doc.font('Helvetica').fontSize(11);

    doc.text(`Número de factura: ${factura.factura_numero}`);
    doc.text(`Fecha: ${factura.factura_fecha_creada.toLocaleDateString()}`);
    doc.text(`Estado: ${factura.factura_estado}`);

    doc.moveDown();

    // Cliente
    doc.font('Helvetica-Bold').text('Cliente');

    doc.font('Helvetica');
    doc.text(nombreCompleto);
    doc.text(usuario.usuario_correo);

    doc.moveDown(1.5);

    // Posiciones de columnas
    const xProducto = 50;
    const xCantidad = 270;
    const xPrecio = 330;
    const xSubtotal = 410;
    const xTotal = 500;

    // Encabezado de tabla
    doc.font('Helvetica-Bold');

    let y = doc.y;

    doc.text('Producto', xProducto, y);
    doc.text('Cant.', xCantidad, y, { width: 40, align: 'center' });
    doc.text('Precio', xPrecio, y, { width: 60, align: 'right' });
    doc.text('Subtotal', xSubtotal, y, { width: 70, align: 'right' });
    doc.text('Total', xTotal, y, { width: 60, align: 'right' });

    y += 18;

    doc
      .moveTo(50, y)
      .lineTo(560, y)
      .stroke();

    y += 10;

    // Productos
    doc.font('Helvetica');

    detalles.forEach((detalle) => {
      doc.text(
        detalle.producto.producto_nombre,
        xProducto,
        y,
        {
          width: 190,
        },
      );

      doc.text(
        detalle.detalle_compra_cantidad.toString(),
        xCantidad,
        y,
        {
          width: 40,
          align: 'center',
        },
      );

      doc.text(
        `$${Number(detalle.detalle_compra_precio_unitario).toFixed(2)}`,
        xPrecio,
        y,
        {
          width: 60,
          align: 'right',
        },
      );

      doc.text(
        `$${Number(detalle.detalle_compra_subtotal).toFixed(2)}`,
        xSubtotal,
        y,
        {
          width: 70,
          align: 'right',
        },
      );

      doc.text(
        `$${Number(detalle.detalle_compra_total).toFixed(2)}`,
        xTotal,
        y,
        {
          width: 60,
          align: 'right',
        },
      );

      y += 22;

      // Nueva página si es necesario
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
    });

    // Línea separadora
    doc.moveTo(50, y).lineTo(560, y).stroke();

    y += 20;

    // Total
    doc.font('Helvetica-Bold').fontSize(13);

    doc.text(
      `Total factura: $${Number(factura.factura_monto_total).toFixed(2)}`,
      350,
      y,
      {
        width: 210,
        align: 'right',
      },
    );

    y += 40;

    // Pie
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('gray')
      .text(
        'Gracias por comprar en Byte & Buy.',
        50,
        y,
        {
          align: 'center',
          width: 510,
        },
      );

    doc.end();

    return pdfBuffer;
  }
}