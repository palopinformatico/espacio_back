import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { Mesa } from './entities/mesa.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersGateway } from 'src/orders/orders.gateway';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';

@Injectable()
export class MesaService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,

    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(ProductsOrders)
    private readonly productsOrdersRepository: Repository<ProductsOrders>,

    private readonly ordersGateway: OrdersGateway
  ) { }

  async findAll(): Promise<Mesa[]> {
    return this.mesaRepository.find({ relations: ['orders'] });
  }

  async findOne(id: number): Promise<Mesa> {
    return this.mesaRepository.findOne({
      where: { id },
      order: { numero_mesa: 'ASC' }, // ✅ usa un campo válido
    });
  }

  async create(createMesaDto: CreateMesaDto): Promise<Mesa> {
    const mesa = this.mesaRepository.create(createMesaDto);
    return this.mesaRepository.save(mesa);
  }

  async update(id: number, updateMesaDto: UpdateMesaDto): Promise<Mesa> {
    const mesa = await this.findOne(id);
    Object.assign(mesa, updateMesaDto);
    return this.mesaRepository.save(mesa);
  }

  async remove(id: number): Promise<void> {
    const mesa = await this.findOne(id);
    await this.mesaRepository.remove(mesa);
  }

  async obtenerMesaPorId(id: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOne({
      where: { id },
      relations: ['orders', 'products'], // si quieres traer relaciones
    });

    if (!mesa) {
      throw new NotFoundException(`La mesa con ID ${id} no existe`);
    }

    return mesa;
  }

  async actualizarEstadoMesa(id: number, status: string) {
    const mesa = await this.mesaRepository.findOne({ where: { id } });
    if (!mesa) {
      throw new NotFoundException('Mesa no encontrada');
    }

    mesa.status = status; // asegúrate que tu entidad tenga este campo
    return await this.mesaRepository.save(mesa);
  }

  async obtenerDetalleMesa(id: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOne({
      where: { id },
      relations: [
        'orders',
        'orders.orderProducts',
        'orders.orderProducts.product', // para traer los detalles de cada producto
      ],
    });

    if (!mesa) {
      throw new NotFoundException(`Mesa con id ${id} no encontrada`);
    }

    return mesa;
  }

  async marcarPedidoPagado(mesaId: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOne({
      where: { id: mesaId },
      relations: ['orders']
    });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    // Marcar todos los pedidos como pagados
    if (mesa.orders?.length) {
      mesa.orders.forEach(order => (order.status = 'pagado'));
      await this.ordersRepository.save(mesa.orders);
    }

    // Actualizar status de la mesa según pedidos restantes no pagados
    const tienePedidosActivos = mesa.orders.some(order => order.status !== 'pagado');
    mesa.status = tienePedidosActivos ? 'Ocupada' : 'Libre';

    const saved = await this.mesaRepository.save(mesa);

    // Emitir evento al frontend
    this.ordersGateway.notifyMesaUpdated(mesa.id, saved.status);

    return saved;
  }

  async crearNuevoPedido(mesaId: number): Promise<Order> {
    // Buscar la mesa
    const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    // Verificar si ya existe una orden activa para esta mesa (no cerrada)
    const ordenActiva = await this.ordersRepository.findOne({
      where: [
        { mesa: { id: mesaId }, estado: 'activo' },
        { mesa: { id: mesaId }, estado: 'pendiente' },
        { mesa: { id: mesaId }, status: 'pendiente' }
      ],
      relations: ['orderProducts']
    });

    if (ordenActiva) {
      // Si ya existe una orden activa, retornarla
      return ordenActiva;
    }

    // Obtener el último numeroVenta
    const lastOrder = await this.ordersRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });
    const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;

    // Crear la orden inicial (sin productos)
    const pedido = this.ordersRepository.create({
      tableNumber: Number(mesa.numero_mesa),
      propina: 0,
      numeroVenta: nextNumeroVenta,
      status: 'Activo',
      total: 0,
      orderType: 'default',
      orderProducts: [], // inicializar array vacío
      mesa: mesa // Asociar la mesa a la orden
    });

    // Actualizar estado de la mesa
    mesa.status = 'Ocupada';
    await this.mesaRepository.save(mesa);

    // Guardar la orden en la base de datos
    return await this.ordersRepository.save(pedido);
  }

  async getPedidosActuales(mesaId: number, numeroVenta: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { mesa: { id: mesaId }, numeroVenta },
    });
  }

  async getProductosPorMesa(mesaId: number): Promise<any[]> {
    // Traer todas las órdenes activas de la mesa con sus productos
    const orders = await this.ordersRepository.find({
      where: { mesa: { id: mesaId }, estado: 'activo' },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!orders.length) {
      throw new NotFoundException('No se encontraron órdenes para esta mesa');
    }

    // Combinar todos los productos de todas las órdenes
    const productos = orders.flatMap(order =>
      order.orderProducts.map(op => ({
        orderId: order.id,
        productoId: op.product?.id,
        nombre: op.product?.name || 'Producto no disponible',
        cantidad: op.cantidad,
        precioUnitario: op.precioUnitario,
        subtotal: op.subtotal,
      })),
    );

    return productos;
  }


  // Eliminar un producto de una orden específica
  async eliminarProducto(
    orderId: number,
    productId: number,
  ): Promise<{ message: string }> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Buscar la relación producto-orden
    const productOrder = order.orderProducts.find(
      (op) => op.product.id === productId,
    );

    if (!productOrder) {
      throw new NotFoundException(
        `El producto con id ${productId} no está en la orden`,
      );
    }

    if (productOrder.cantidad > 1) {
      // Si hay más de una unidad, restamos 1
      productOrder.cantidad -= 1;
      await this.ordersRepository.save(order);
    } else {
      // Si solo queda 1 unidad, quitamos la relación
      order.orderProducts = order.orderProducts.filter(
        (op) => op.product.id !== productId,
      );
      await this.ordersRepository.save(order);
    }

    return { message: 'Producto eliminado correctamente' };
  }


  async getPedidosPorMesa(mesaId: number): Promise<any[]> {
    const pedidos = await this.ordersRepository.find({
      where: { mesa: { id: mesaId } },
      relations: ['orderProducts', 'orderProducts.product', 'mesa'],
      order: { createdAt: 'DESC' },
    });

    return pedidos.map(pedido => {
      const totalProductos = pedido.orderProducts.reduce(
        (sum, p) => sum + p.subtotal,
        0,
      );

      return {
        id: pedido.id,
        numeroVenta: pedido.numeroVenta,
        estado: pedido.estado,
        createdAt: pedido.createdAt,
        propina: pedido.propina || 0,
        totalProductos,
        totalFinal: totalProductos + (pedido.propina || 0),
        productos: pedido.orderProducts.map(op => ({
          id: op.product?.id,
          nombre: op.product?.name || 'Producto no disponible',
          cantidad: op.cantidad,
          precioUnitario: op.precioUnitario,
          subtotal: op.subtotal,
        })),
      };
    });
  }


  async getMesaDetail(mesaId: number, fecha?: string) {
    // Preparar la fecha en formato correcto (YYYY-MM-DD)
    let fechaFiltro: string | undefined;
    if (fecha) {
      // Si la fecha viene en formato ISO (YYYY-MM-DD), la usamos directamente
      // Si viene en otro formato, la convertimos
      const fechaObj = new Date(fecha);
      if (!isNaN(fechaObj.getTime())) {
        // Extraer año, mes y día en formato UTC para evitar problemas de timezone
        const year = fechaObj.getFullYear();
        const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaObj.getDate()).padStart(2, '0');
        fechaFiltro = `${year}-${month}-${day}`;
      }
    }

    // Traer detalle de productos vendidos con el mismo enfoque que obtenerPendientes
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.orderProducts', 'op')
      .leftJoin('op.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'producto')
      .addSelect('op.precioUnitario', 'precioUnitario')
      .addSelect('SUM(op.cantidad)', 'cantidad')
      .addSelect('SUM(op.subtotal)', 'subtotal')
      .where('order.mesaId = :mesaId', { mesaId })
      .andWhere('order.status = :status', { status: 'pendiente' });

    if (fechaFiltro) {
      queryBuilder.andWhere('DATE(order.createdAt) = :fecha', { fecha: fechaFiltro });
    }

    // Agrupar por productId Y precioUnitario para manejar cambios de precio
    queryBuilder.groupBy('product.id, op.precioUnitario');

    const detalleRaw = await queryBuilder.getRawMany();

    // Convertir a números explícitamente
    const detalle = detalleRaw.map((item) => ({
      productId: Number(item.productId),
      producto: item.producto || 'Producto no disponible',
      precioUnitario: Number(item.precioUnitario),
      cantidad: Number(item.cantidad),
      subtotal: Number(item.subtotal),
    }));

    // Totales exactos del día por mesa
    const totalQuery = this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .addSelect('SUM(order.propina)', 'totalPropina')
      .where('order.mesaId = :mesaId', { mesaId })
      .andWhere('order.status = :status', { status: 'pendiente' });

    if (fechaFiltro) {
      totalQuery.andWhere('DATE(order.createdAt) = :fecha', { fecha: fechaFiltro });
    }

    const totales = await totalQuery.getRawOne();

    return {
      mesaId,
      fecha: fechaFiltro ?? 'todas las fechas',
      detalle,
      totalMesa: Number(totales.total) || 0,
      propina: Number(totales.totalPropina) || 0,
      totalConPropina:
        (Number(totales.total) || 0) + (Number(totales.totalPropina) || 0),
    };
  }

  async obtenerDetalleMesaActual(mesaId: number): Promise<Mesa> {
    return await this.mesaRepository.findOne({
      where: { id: mesaId },
      relations: ['orders', 'orders.orderProducts', 'orders.orderProducts.product'],
    });
  }

  async getMesa(mesaId: number): Promise<Mesa> {
    if (isNaN(mesaId) || mesaId <= 0) {
      throw new BadRequestException('ID de mesa inválido');
    }

    const mesa = await this.mesaRepository.findOne({
      where: { id: mesaId },
    });

    if (!mesa) throw new NotFoundException('Mesa no encontrada');
    return mesa;
  }

  async updateDetalleVenta(
    orderId: number,
    updateData: {
      propina?: number;
      status?: string;
      detalle_venta?: string;
      paymentMethod?: string;
      productos?: Array<{
        productId: number;
        cantidad: number;
        precioUnitario: number;
      }>;
    },
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['mesa', 'orderProducts', 'orderProducts.product'],
    });

    if (!order) {
      throw new NotFoundException(`Orden con id ${orderId} no encontrada`);
    }

    // Actualizar los campos básicos
    if (updateData.propina !== undefined) {
      order.propina = updateData.propina;
    }
    if (updateData.status !== undefined) {
      order.status = updateData.status;
    }
    if (updateData.detalle_venta !== undefined) {
      order.detalle_venta = updateData.detalle_venta;
    }
    if (updateData.paymentMethod !== undefined) {
      order.paymentMethod = updateData.paymentMethod;
    }

    // Actualizar productos si se proporcionan
    if (updateData.productos && updateData.productos.length > 0) {
      // Eliminar todos los productos actuales de la orden
      await this.productsOrdersRepository.delete({ orderId: order.id });

      // Insertar los nuevos productos con sus precios actualizados
      const productosNuevos = updateData.productos.map((prod) => {
        const subtotal = prod.cantidad * prod.precioUnitario;
        return this.productsOrdersRepository.create({
          orderId: order.id,
          productId: prod.productId,
          cantidad: prod.cantidad,
          precioUnitario: prod.precioUnitario,
          subtotal: subtotal,
        });
      });

      await this.productsOrdersRepository.save(productosNuevos);

      // Recalcular el total de productos
      const subtotalProductos = productosNuevos.reduce(
        (sum, op) => sum + op.subtotal,
        0,
      );
      order.neto = subtotalProductos;
      order.total = subtotalProductos + (order.propina || 0);
    } else {
      // Si no se actualizan productos, solo recalcular total si cambió la propina
      if (updateData.propina !== undefined) {
        const subtotalProductos = order.orderProducts.reduce(
          (sum, op) => sum + op.subtotal,
          0,
        );
        order.neto = subtotalProductos;
        order.total = subtotalProductos + order.propina;
      }
    }

    await this.ordersRepository.save(order);

    // Notificar cambios por WebSocket si es necesario
    if (order.mesa) {
      this.ordersGateway.notifyMesaUpdated(order.mesa.id, order.mesa.status);
    }

    // Recargar la orden con las relaciones actualizadas
    return await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['mesa', 'orderProducts', 'orderProducts.product'],
    });
  }

}