import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { Venta } from '../venta/entities/venta.entity';
import { Pago } from '../pago/entities/pago.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { ResponseFacturaDto } from './dto/response-factura.dto';
import { PdfFacturaService } from './pdf-factura.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class FacturaService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    private readonly pdfFacturaService: PdfFacturaService,
    private readonly mailService: MailService,
  ) { }

  private toResponseDto(factura: Factura): ResponseFacturaDto {
    return {
      factura_id: factura.factura_id,
      venta_id: factura.venta_id,
      pago_id: factura.pago_id,
      factura_numero: factura.factura_numero,
      factura_monto_total: factura.factura_monto_total,
      factura_estado: factura.factura_estado,
      factura_fecha_creada: factura.factura_fecha_creada,
      factura_fecha_enviada: factura.factura_fecha_enviada,
      factura_enviada: factura.factura_enviada,
    };
  }

  private async generarNumeroFactura(): Promise<string> {
    const ultimaFactura = await this.facturaRepository
      .createQueryBuilder('factura')
      .orderBy('factura.factura_id', 'DESC')
      .getOne();

    const siguiente = ultimaFactura
      ? ultimaFactura.factura_id + 1
      : 1;

    return `FACT-${String(siguiente).padStart(6, '0')}`;
  }

  async generarFactura(datos: CreateFacturaDto): Promise<ResponseFacturaDto> {
    const venta = await this.ventaRepository.findOne({
      where: { venta_id: datos.venta_id },
      relations: ['detallesCompra'],
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (venta.detallesCompra.length === 0) {
      throw new BadRequestException(
        'La venta no posee detalles de compra',
      );
    }

    const pago = await this.pagoRepository.findOneBy({
      pago_id: datos.pago_id,
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (pago.venta_id !== venta.venta_id) {
      throw new BadRequestException(
        'El pago no pertenece a la venta indicada',
      );
    }

    const facturaExistente = await this.facturaRepository.findOne({
      where: {
        venta_id: venta.venta_id,
      },
    });

    if (facturaExistente) {
      throw new BadRequestException(
        'La venta ya posee una factura',
      );
    }

    const montoTotal = venta.detallesCompra.reduce(
      (acumulado, detalle) =>
        acumulado + Number(detalle.detalle_compra_total),
      0,
    );

    const factura = this.facturaRepository.create({
      venta_id: venta.venta_id,
      pago_id: pago.pago_id,
      factura_numero: await this.generarNumeroFactura(),
      factura_monto_total: Number(montoTotal.toFixed(2)),
      factura_estado: 'generada',
      factura_enviada: false,
    });

    const guardado = await this.facturaRepository.save(factura);

    return this.toResponseDto(guardado);
  }

  async enviarFactura(factura_id: number): Promise<ResponseFacturaDto> {
    const factura = await this.facturaRepository.findOne({
      where: { factura_id },
      relations: [
        'venta',
        'venta.usuario',
        'venta.detallesCompra',
        'venta.detallesCompra.producto',
        'pago',
      ],
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    const pdf = await this.pdfFacturaService.generarPdf(factura);

    await this.mailService.enviarFactura(
      factura.venta.usuario.usuario_correo,
      pdf,
      factura.factura_numero,
      `Total de compra: $${factura.factura_monto_total}`,
    );

    factura.factura_enviada = true;
    factura.factura_fecha_enviada = new Date();
    factura.factura_estado = 'enviada';

    const guardado = await this.facturaRepository.save(factura);

    return this.toResponseDto(guardado);
  }

  async findOne(factura_id: number): Promise<ResponseFacturaDto> {
    const factura = await this.facturaRepository.findOneBy({
      factura_id,
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    return this.toResponseDto(factura);
  }

  async findByVenta(
    venta_id: number,
  ): Promise<ResponseFacturaDto[]> {
    const facturas = await this.facturaRepository.find({
      where: {
        venta_id,
      },
      order: {
        factura_fecha_creada: 'DESC',
      },
    });

    return facturas.map((factura) =>
      this.toResponseDto(factura),
    );
  }

  async update(
    factura_id: number,
    datos: UpdateFacturaDto,
  ): Promise<ResponseFacturaDto> {
    const factura = await this.facturaRepository.findOneBy({
      factura_id,
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    Object.assign(factura, datos);

    const guardado = await this.facturaRepository.save(factura);

    return this.toResponseDto(guardado);
  }
}