import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Servicio de correo electrónico.
 * Contiene la lógica para enviar correos electrónicos.
 */
@Injectable()
export class MailService {
  /** Transportador de nodemailer para enviar correos. */
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  /**
   * Envía un correo con un código de recuperación de contraseña.
   * @param email Correo electrónico del destinatario.
   * @param codigo Código de recuperación.
   */
  async enviarCodigo(email: string, codigo: string) {
    await this.transporter.sendMail({
      from: `"Soporte Byte & Buy" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Código de recuperación',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Tu código es:</p>
        <h1>${codigo}</h1>
        <p>Este código expira en 15 minutos.</p>
      `,
    });
  }

  async enviarFactura(
    email: string,
    pdf: Buffer,
    numeroFactura: string,
    resumen: string,
  ) {
    await this.transporter.sendMail({
      from: `"Byte & Buy" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Factura ${numeroFactura}`,
      html: `
      <h2>Factura de compra</h2>

      <p>Gracias por realizar tu compra.</p>

      <p>
        ${resumen}
      </p>

      <p>
        Adjuntamos tu factura en formato PDF.
      </p>
    `,
      attachments: [
        {
          filename: `${numeroFactura}.pdf`,
          content: pdf,
        },
      ],
    });
  }
}
