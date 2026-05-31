import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { join } from 'path';
import { print } from 'pdf-to-printer';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as QRCode from 'qrcode';


// DTO opcional para tipado
export interface OrderDTO {
  id: number;
  tableNumber: number | null;
  orderType: string;
  detalle_venta: string | null;
  estado: string;
  propina: number;
  status: string;
  total: number;
  createdAt: Date;
  paymentMethod: string | null;
  numeroVenta: number;
  mesa: { id: number; numero_mesa: string } | null;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  } | null;
  products: {
    productId: number;
    name: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    imageUrl?: string;
  }[];
}



@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class OrdersGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('printTicket')
  async handlePrint(@MessageBody() data: any) {
    try {
      const filePath = `ticket-${Date.now()}.pdf`;
      const doc = new PDFDocument({ size: [250, 400], margin: 10 });
      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(14).text('TICKET DE PEDIDO', { align: 'center', underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Mesa: ${data.mesa}`);
      doc.text(`Total: $${data.total}`);
      doc.moveDown();

      data.items.forEach(item => {
        doc.text(`${item.cantidad} x ${item.nombre} - $${item.precio}`);
      });

      doc.end();

      await new Promise(resolve => doc.on('finish', resolve));

      await print(filePath, { printer: 'pos-80' });

      return { status: 'ok', message: 'Ticket impreso correctamente' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }


  notifyNewOrder(order: any) {
    const sanitized = this.sanitizeOrder(order);
    this.server.emit('newOrder', sanitized);
  }

  // Emitir actualización de pedido
  notifyOrderUpdated(order: Order) {
    const payload = this.sanitizeOrder(order);
    this.server.emit('orderStatusUpdated', payload);
  }

  // Emitir actualización de mesa
  notifyMesaUpdated(mesaId: number, status: string) {
    this.server.emit('mesaStatusUpdated', { mesaId, status });
  }

  // Emitir órdenes actualizadas de una mesa (para WebSocket en tiempo real)
  notifyMesaOrdenesUpdated(mesaId: number, ordenes: any) {
    this.server.emit('mesaOrdenesUpdated', { mesaId, ordenes });
  }

  broadcast(theme: any) {
    this.server.emit('themeUpdated', theme);
  }

  // ✅ Notificar pendientes actualizados (para delivery)
  notifyPendientesUpdated(pendientes: any) {
    this.server.emit('pendientesUpdated', pendientes);
  }

  // Evitar referencias circulares y objetos grandes
  sanitizeOrder(order: Order): OrderDTO {
    return {
      id: order.id,
      tableNumber: order.tableNumber ?? null,
      orderType: order.orderType,
      detalle_venta: order.detalle_venta ?? null,
      estado: order.estado,
      propina: order.propina,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod ?? null,
      numeroVenta: order.numeroVenta,
      mesa: order.mesa
        ? { id: order.mesa.id, numero_mesa: order.mesa.numero_mesa }
        : null,
      customer: order.customer
        ? {
          id: order.customer.id,
          name: order.customer.customerName,
          email: order.customer.customerEmail,
          phone: order.customer.customerPhone,
        }
        : null,
      products: order.orderProducts?.map(op => ({
        productId: op.product?.id,
        name: op.product?.name || 'Producto no disponible',
        cantidad: op.cantidad,
        precioUnitario: op.precioUnitario,
        subtotal: op.subtotal,
        imageUrl: op.product?.imageUrl ?? undefined,
      })) || [],
    };
  }



}

