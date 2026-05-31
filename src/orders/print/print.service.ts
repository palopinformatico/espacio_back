import { Injectable, BadRequestException } from '@nestjs/common';
import ThermalPrinter from 'node-thermal-printer';

@Injectable()
export class PrintService {
  async printFactura(data: any) {
    try {
      const printer = new ThermalPrinter.printer({
        type: ThermalPrinter.types.EPSON, // o STAR según tu impresora
        interface: data.ip ? `tcp://${data.ip}` : 'usb',
        options: {
          timeout: 5000,
        },
      });

      const isConnected = await printer.isPrinterConnected();
      if (!isConnected) {
        throw new BadRequestException('No se pudo conectar con la impresora');
      }

      // Encabezado
      printer.alignCenter();
      printer.println(data.header || 'FACTURA / PEDIDO');
      printer.drawLine();

      // Datos cliente
      printer.alignLeft();
      printer.println(`Cliente: ${data.nombre} ${data.apellido}`);
      printer.println(`Dirección: ${data.direccion}`);
      printer.println(`Teléfono: ${data.telefono}`);
      printer.println(`Email: ${data.email}`);
      printer.println(`Método de pago: ${data.pago}`);
      printer.println(`Fecha: ${new Date().toLocaleString()}`);
      printer.drawLine();

      // Productos
      printer.println('Producto              Cant  Precio  Total');
      printer.drawLine();
      data.carrito.forEach((item: any) => {
        const total = item.cantidad * item.price;
        printer.println(
          `${item.name.padEnd(18)} ${item.cantidad
            .toString()
            .padStart(3)} ${item.price.toString().padStart(6)} ${total
            .toString()
            .padStart(6)}`
        );
      });
      printer.drawLine();

      // Total
      const total = data.carrito.reduce(
        (sum: number, i: any) => sum + i.cantidad * i.price,
        0,
      );
      printer.alignRight();
      printer.println(`TOTAL: $${total}`);

      // Pie
      printer.alignCenter();
      printer.println(data.footer || 'Gracias por su compra!');
      printer.cut();

      // Enviar a la impresora
      await printer.execute();

      return { success: true };
    } catch (err) {
      console.error('Error de impresión:', err);
      throw new BadRequestException('Error al imprimir: ' + err.message);
    }
  }
}
