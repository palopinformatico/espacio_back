import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateSOrderDto } from './dto/create.sorder';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { OrdersGateway } from './orders.gateway';
import { MailService } from 'src/mail/mail.service';
import { CostoEnvio } from 'src/costo_envio/entities/costo_envio.entity';
import { EtaService } from 'src/eta/eta.service';


@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
    @InjectRepository(ProductsOrders)
    private readonly productsOrdersRepository: Repository<ProductsOrders>,
    @InjectRepository(CostoEnvio)
    private readonly costoEnvioRepository: Repository<CostoEnvio>,
    private ordersGateway: OrdersGateway,
    private mailService: MailService,
    private readonly etaService: EtaService,
  ) { }




  async update(
    id: number,
    dto: UpdateOrderDto & { propinaTipo?: string; propinaValor?: number }
  ) {
    console.log('🔶 SERVICE UPDATE - ID:', id, 'DTO:', dto);
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderProducts', 'orderProducts.product', 'customer', 'mesa'],
    });

    if (!order) throw new NotFoundException('Orden no encontrada');

    // ✅ Calcular subtotal de productos (neto) - NO se modifica
    const neto = order.orderProducts.reduce(
      (acc, op) => acc + op.subtotal,
      0
    );

    // ✅ Calcular la nueva propina basándose en el neto
    let nuevaPropina = order.propina; // ← arranca con la que ya tiene

    // 🔍 Debug log para verificar que el endpoint se está llamando
    if (dto.propinaTipo !== undefined) {
      console.log(`🔄 Actualizando propina - Orden ID: ${id}`);
      console.log(`   ↳ Neto actual: ${neto}`);
      console.log(`   ↳ Propina anterior: ${order.propina}`);
      console.log(`   ↳ Tipo de propina solicitado: ${dto.propinaTipo}`);

      switch (dto.propinaTipo) {
        case '5': nuevaPropina = Math.round(neto * 0.05); break;
        case '10': nuevaPropina = Math.round(neto * 0.10); break;
        case '12': nuevaPropina = Math.round(neto * 0.12); break;
        case 'custom': nuevaPropina = dto.propinaValor ?? 0; break;
        case 'none': nuevaPropina = 0; break;
      }

      console.log(`   ↳ Nueva propina calculada: ${nuevaPropina}`);
      console.log(`   ↳ Total final: ${neto + nuevaPropina}`);
    }

    // ✅ Actualizar solo propina y total (el neto NO cambia)
    order.propina = nuevaPropina;
    order.neto = neto;
    order.total = neto + nuevaPropina;

    const camposValidos: (keyof UpdateOrderDto)[] = [
      'tableNumber',
      'orderType',
      'status',
      'userId',
      'customerId',
    ];

    for (const campo of camposValidos) {
      if (dto[campo] !== undefined) {
        order[campo] = dto[campo];
      }
    }

    // ✅ Guardar SOLO los campos necesarios
    await this.orderRepository.save({
      id: order.id,
      neto: order.neto,      // ✅ Guardar el neto calculado
      propina: order.propina, // ✅ Solo la propina cambia
      total: order.total,     // ✅ Total = neto + propina
      tableNumber: order.tableNumber,
      orderType: order.orderType,
      status: order.status,
    });

    // ✅ Recargar la orden con todos los datos actualizados
    const ordenActualizada = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderProducts', 'orderProducts.product', 'customer', 'mesa'],
    });

    // ✅ Emitir por WebSocket DESPUÉS de guardar para reflejar cambios al instante
    this.ordersGateway.notifyOrderUpdated(ordenActualizada);

    // ✅ Si hay mesa asociada, notificar actualización de la mesa también
    if (ordenActualizada.mesa) {
      this.ordersGateway.notifyMesaUpdated(
        ordenActualizada.mesa.id,
        ordenActualizada.mesa.status
      );
    }

    return ordenActualizada;
  }

  async create(createOrderDto: CreateOrderDto) {
    const { products, mesaId, orderType = 'local' } = createOrderDto;

    // ✅ Validar mesa
    const mesa = await this.mesaRepository.findOne({ where: { id: Number(mesaId) } });
    if (!mesa) throw new BadRequestException('La mesa no exist');

    // ✅ Sanitizar numero de mesa (extraer solo dígitos si es necesario)
    const tableNumber = parseInt(String(mesa.numero_mesa).replace(/\D/g, ''), 10) || 0;

    // ✅ Numero de venta antes de crear el pedido
    const numeroVenta = await this.generarNumeroVenta();

    // ✅ Validar productos antes de crear la orden
    if (!products || products.length === 0) {
      throw new BadRequestException('El pedido debe tener productos');
    }

    const productIds = products.map(p => p.id);
    const productEntities = await this.productRepository.findBy({ id: In(productIds) });

    if (productEntities.length !== products.length) {
      throw new BadRequestException('Uno o más productos no existen');
    }

    // ✅ Calcular neto (total de productos) y preparar orderProducts
    console.log('=== DEBUG create ===');
    console.log('Products recibidos:', products);
    console.log('Cantidad de productos:', products.length);
    let neto = 0;
    const orderProductsData = products.map(p => {
      const productEntity = productEntities.find(pe => pe.id === p.id)!;
      const price = Number(productEntity.price) || 0;
      const cantidad = Number(p.cantidad) || 0;
      const subtotal = price * cantidad;

      console.log(`Producto ${p.id}: precio=${price}, cantidad=${cantidad}, subtotal=${subtotal}`);
      neto += subtotal;

      return {
        productId: productEntity.id,
        cantidad,
        precioUnitario: price,
        subtotal,
        product: productEntity,
      };
    });
    console.log('Neto total calculado:', neto);

    // ✅ Calcular propina automáticamente: 10% del neto (total de productos)
    // Fórmula: propina = neto × 0.10 (10%)
    const propinaCalculada = Math.round(neto * 0.10);

    // ✅ Calcular total final: neto + propina
    const totalFinal = neto + propinaCalculada;

    // ✅ Crear pedido con total calculado
    const newOrder = this.orderRepository.create({
      tableNumber,
      orderType,
      estado: 'activo',
      status: 'pendiente',
      paymentMethod: '',
      propina: propinaCalculada,
      neto: neto,
      total: totalFinal,
      numeroVenta,
      mesa,
      detalle_venta: createOrderDto.detalle_venta || null,
    });

    // ✅ Guardar pedido
    const savedOrder = await this.orderRepository.save(newOrder);

    // ✅ Crear y guardar orderProducts con orderId
    const orderProducts = orderProductsData.map(op =>
      this.productsOrdersRepository.create({
        orderId: savedOrder.id,
        ...op,
      })
    );

    await this.productsOrdersRepository.save(orderProducts);

    // ✅ Actualizar mesa
    mesa.status = 'ocupada';
    await this.mesaRepository.save(mesa);

    // ✅ Cargar pedido final
    const fullOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['customer', 'orderProducts', 'orderProducts.product', 'mesa'],
    });

    const sanitized = this.sanitizeOrder(fullOrder);

    // ✅ WebSocket
    Promise.resolve().then(async () => {
      this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
      this.ordersGateway.notifyNewOrder(sanitized);
      
      // ✅ Emitir pendientes actualizados para que se actualice la vista en tiempo real
      try {
        const pendientesActualizados = await this.obtenerPendientes();
        this.ordersGateway.notifyPendientesUpdated(pendientesActualizados);
      } catch (error) {
        console.error('Error al emitir pendientes actualizados:', error);
      }
    });

    return sanitized;
  }


  async creates(createOrderDto: CreateSOrderDto) {
    const { products = [], orderType = 'delivery' } = createOrderDto;
    const { neto = 0 } = createOrderDto;
    if (orderType !== 'delivery') {
      throw new BadRequestException('Este método solo permite pedidos de delivery.');
    }
    const safeNeto = Number(neto) || 0;
    // -----------------------------
    // A) Resolver cliente
    // -----------------------------
    let customer = null;

    if (createOrderDto.customerId) {
      customer = await this.customerRepository.findOne({
        where: { id: createOrderDto.customerId }
      });
      if (!customer) throw new NotFoundException('Cliente no encontrado');
    }

    if (!customer && createOrderDto.newCustomer) {
      const nc = createOrderDto.newCustomer;
      customer = await this.customerRepository.save(
        this.customerRepository.create({
          customerName: nc.customerName,
          customerEmail: nc.customerEmail || null,
          customerAddress: nc.customerAddress || null,
          customerPhone: nc.customerPhone || null,
        })
      );
    }

    if (!customer) {
      throw new BadRequestException('Debe proporcionar customerId o newCustomer');
    }

    // -----------------------------
    // B) Numero de Venta
    // -----------------------------
    const { max } = await this.orderRepository
      .createQueryBuilder('order')
      .select('MAX(order.numeroVenta)', 'max')
      .getRawOne();

    const nextNumeroVenta = (max || 0) + 1;

    // -----------------------------
    // C) Crear la orden base
    // -----------------------------
    let order = this.orderRepository.create({
      detalle_venta: createOrderDto.detalle_venta,
      status: 'pendiente',
      orderType,
      costo_delivery:createOrderDto.costo_delivery,
      neto: safeNeto,
      paymentMethod: createOrderDto.paymentMethod || 'pendiente',
      numeroVenta: nextNumeroVenta,
      total: 0,
      customer,
    });

    order = await this.orderRepository.save(order);

    // -----------------------------
    // D) Validar productos
    // -----------------------------
    if (!products.length) {
      throw new BadRequestException('La orden debe incluir productos');
    }

    const productIds = products.map(p => p.id);
    const productEntities = await this.productRepository.findBy({ id: In(productIds) });

    if (productEntities.length !== products.length) {
      throw new BadRequestException('Uno o más productos no existen');
    }

    // -----------------------------
    // E) Construir order_products
    // -----------------------------
    let total = 0;
    const ops: ProductsOrders[] = [];

    for (const p of products) {
      const prod = productEntities.find(x => x.id === p.id);
      const price = isNaN(Number(prod.price)) ? 0 : Number(prod.price);
      const cantidad = isNaN(Number(p.cantidad)) ? 0 : Number(p.cantidad);
      const subtotal = price * cantidad;
      total += subtotal;

      const op = this.productsOrdersRepository.create({
        orderId: order.id,
        productId: prod.id,
        cantidad: cantidad,
        precioUnitario: price,
        subtotal,
      });
      ops.push(op);
    }

    await this.productsOrdersRepository.save(ops);

    // -----------------------------
    // F) Obtener costo de envío
    // -----------------------------
    let costoEnvio = 0;
    try {
      console.log('🔍 Buscando costo de envío en BD...');
      // Primero buscar el registro marcado como por defecto
      let costoEnvioData = await this.costoEnvioRepository.findOne({
        where: { porDefecto: true },
      });

      // Si no hay registro por defecto, buscar el último con precio_envio > 0
      if (!costoEnvioData) {
        console.log('🔍 No hay registro por defecto, buscando último con precio > 0...');
        const allCostos = await this.costoEnvioRepository.find({
          where: {},
          order: { id: 'DESC' },
        });
        costoEnvioData = allCostos.find(c => c.precio_envio > 0);
      }

      console.log('🔍 costoEnvioData:', costoEnvioData);
      if (costoEnvioData) {
        costoEnvio = isNaN(Number(costoEnvioData.precio_envio)) ? 0 : Number(costoEnvioData.precio_envio);
        console.log('🔍 precio_envio encontrado:', costoEnvioData.precio_envio);
        console.log('🔍 costoEnvio calculado:', costoEnvio);
      } else {
        console.warn('⚠️ No se encontró ningún registro válido de costo_envio en la BD');
      }
    } catch (error) {
      console.error('❌ Error al obtener costo de envío, usando 0:', error);
    }

    // -----------------------------
    // G) Actualizar total con costo de envío
    // -----------------------------
    const safeTotal = isNaN(Number(total)) ? 0 : Number(total);
    order.neto = safeTotal;
    order.costo_delivery = costoEnvio;
    order.total = safeTotal + costoEnvio;

    await this.orderRepository.save(order);

    // -----------------------------
    // H) Retornar full order y Notificar
    // -----------------------------
    const full = await this.orderRepository.findOne({
      where: { id: order.id },
      relations: ['customer', 'orderProducts', 'orderProducts.product'],
    });

    const sanitized = this.sanitizeOrder(full);

    Promise.resolve().then(async () => {
      this.ordersGateway.notifyNewOrder(sanitized);
      
      // ✅ Emitir pendientes actualizados para que se actualice la vista en tiempo real
      try {
        const pendientesActualizados = await this.obtenerPendientes();
        this.ordersGateway.notifyPendientesUpdated(pendientesActualizados);
      } catch (error) {
        console.error('Error al emitir pendientes actualizados:', error);
      }
    });

    // ============================================================
    // NUEVA LÓGICA: CALCULAR ETA ANTES DE ENVIAR EMAIL
    // ============================================================
    let tiempoEstimadoFinal = '50 minutos'; // Valor por defecto (Fallback)

    if (customer.customerAddress) {
      try {
        // Llamamos a tu servicio calculateEta
        // Nota: order.id y customer.id son opcionales en tu servicio, pero útiles para logs
        const etaResult = await this.etaService.calculateEta(
          customer.customerAddress,
          order.id,
          customer.id
        );

        // Si el servicio devuelve tiempo_min, lo formateamos
        if (etaResult && etaResult.tiempo_min) {
          tiempoEstimadoFinal = `${etaResult.tiempo_min} minutos`;
        }
      } catch (error) {
        // Si falla el cálculo de ruta, solo logueamos y mantenemos el valor por defecto '50 minutos'
        console.warn(`No se pudo calcular ETA para orden #${order.numeroVenta}:`, error.message);
      }
    }

    // -----------------------------
    // I) Enviar email de confirmación
    // -----------------------------
    console.log('🔍 ORDERS SERVICE: Verificando si se debe enviar email...');
    console.log('🔍 ORDERS SERVICE: customer existe:', !!customer);
    console.log('🔍 ORDERS SERVICE: customer.customerEmail:', customer?.customerEmail || 'NO TIENE EMAIL');
    console.log('🔍 ORDERS SERVICE: customer.customerName:', customer?.customerName || 'NO TIENE NOMBRE');
    
    if (customer.customerEmail) {
      console.log('🔍 ORDERS SERVICE: Cliente tiene email, intentando enviar confirmación...');
      console.log('🔍 ORDERS SERVICE: Email del cliente:', customer.customerEmail);
      try {
        const productsForEmail = full.orderProducts.map(op => ({
          name: op.product?.name || 'Producto desconocido',
          cantidad: op.cantidad,
          price: op.subtotal,
        }));

        console.log('🔍 ORDERS SERVICE: Llamando a mailService.sendOrderConfirmation...');
        await this.mailService.sendOrderConfirmation({
          customerEmail: customer.customerEmail,
          customerName: customer.customerName,
          numeroVenta: nextNumeroVenta,
          fecha: new Date().toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          orderType: 'Envío a domicilio',
          customerAddress: customer.customerAddress || 'No especificada',

          // AQUÍ USAMOS LA VARIABLE CALCULADA
          tiempoEstimado: tiempoEstimadoFinal,

          products: productsForEmail,
          subtotal: total,
          costoEnvio: costoEnvio,
          total: order.total,
        });
        console.log('✅ ORDERS SERVICE: Email de confirmación enviado exitosamente');
      } catch (error) {
        console.error('Error al enviar email, pero la orden se creó correctamente:', error);
      }
    }

    return sanitized;
  }






  async findAll() {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderProducts', 'orderProducts')
      .leftJoinAndSelect('orderProducts.product', 'product')
      .orderBy('product.price', 'ASC')
      .getMany();

    // Sanitizar valores numéricos para evitar NaN
    return orders.map(order => ({
      ...order,
      tableNumber: Number(order.tableNumber) || 0,
      total: Number(order.total) || 0,
      propina: Number(order.propina) || 0,
      numeroVenta: Number(order.numeroVenta) || 0,
    }));
  }

  async findOne(id: number) {
    return await this.orderRepository.findOneBy({ id });
  }







  async remove(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`La orden con ID ${id} no existe`);
    }

    // Soft delete (marcar como eliminado en deletedAt)
    await this.orderRepository.softRemove(order);

    return { message: 'Orden eliminada correctamente', id };
  }

  async cancelarOrden(id: number) {
    const orden = await this.orderRepository.findOneBy({ id });
    if (!orden) throw new NotFoundException('Orden no encontrada');

    orden.status = 'cancelado';
    return this.orderRepository.save(orden);
  }

  async getProductosPorMesa(mesaId: number): Promise<any[]> {
    // Traer todas las órdenes activas de la mesa con sus productos
    const orders = await this.orderRepository.find({
      where: { mesa: { id: mesaId }, estado: 'activo' },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!orders.length) {
      throw new NotFoundException('No se encontraron órdenes para esta mesa');
    }

    // Combinar productos de todas las órdenes, incluyendo orderId para luego eliminarlos si hace falta
    const productos = orders.flatMap(order =>
      order.orderProducts.map(op => ({
        orderId: order.id,
        productoId: op.product?.id,
        nombre: op.product?.name || 'Producto no disponible',
        precio: op.product?.price || 0,
        cantidad: op.cantidad,
      })),
    );

    return productos;
  }

  // Eliminar un producto de una orden específica
  async eliminarProducto(orderId: number, productId: number) {
    // 1️⃣ Buscar la relación producto-orden
    const orderProduct = await this.productsOrdersRepository.findOne({
      where: { orderId, productId },
      relations: ['product', 'order'],
    });

    if (!orderProduct) {
      throw new NotFoundException('El producto no está en la orden');
    }

    // 2️⃣ Eliminar el producto de la orden
    await this.productsOrdersRepository.delete({ orderId, productId });

    // 3️⃣ Obtener productos restantes
    const remainingProducts = await this.productsOrdersRepository.find({
      where: { orderId },
    });

    // 4️⃣ Recalcular total
    const newTotal = remainingProducts.reduce((sum, op) => sum + op.subtotal, 0);

    // 5️⃣ Opcional: actualizar status o propina si no quedan productos
    const updatedOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderProducts'],
    });

    updatedOrder.total = newTotal;
    if (remainingProducts.length === 0) {
      updatedOrder.status = 'vacío'; // o 'cancelado', según tu lógica
      updatedOrder.propina = 0;
    }

    await this.orderRepository.save(updatedOrder);

    // 6️⃣ Devolver la orden actualizada completa
    return updatedOrder;
  }

  async getHistorialPorMesa(mesaId: number, fecha?: string) {
    let queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderProducts', 'orderProducts')
      .leftJoinAndSelect('orderProducts.product', 'product')
      .where('order.mesaId = :mesaId', { mesaId })
      .andWhere('order.status = :status', { status: 'pagado' })  // ✅ Solo mostrar pedidos pagados
      .orderBy('order.createdAt', 'DESC');

    // Si no se proporciona fecha, usar el día de hoy por defecto
    const fechaFiltro = fecha || new Date().toISOString().split('T')[0];

    // Filtrar por el día específico (hoy o la fecha proporcionada)
    const inicio = new Date(fechaFiltro);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(fechaFiltro);
    fin.setHours(23, 59, 59, 999);

    queryBuilder = queryBuilder.andWhere(
      'order.createdAt BETWEEN :inicio AND :fin',
      { inicio, fin }
    );

    const pedidos = await queryBuilder.getMany();

    if (!pedidos.length) {
      console.warn('⚠️ No se encontraron pedidos para la mesa', mesaId, fecha ? `en la fecha ${fecha}` : '');
      return [];
    }

    return pedidos.map(pedido => {
      const totalProductos = pedido.orderProducts.reduce((sum, op) => sum + op.subtotal, 0);
      return {
        numeroVenta: pedido.numeroVenta,
        mesaId: pedido.mesaId,
        status: pedido.status,
        estado: pedido.estado,
        createdAt: pedido.createdAt,
        fechaHora: pedido.createdAt.toLocaleString('es-CL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        propina: pedido.propina,
        totalProductos,
        totalPedido: totalProductos + (pedido.propina || 0),
        products: pedido.orderProducts.map(op => ({
          id: op.product?.id,
          nombre: op.product?.name || 'Producto no disponible',
          cantidad: op.cantidad,
          precio: op.precioUnitario,
          subtotal: op.subtotal,
        })),
      };
    });
  }


async obtenerPendientes() {
  const orders = await this.orderRepository
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.mesa', 'mesa')
    .leftJoinAndSelect('order.customer', 'customer')
    .leftJoinAndSelect('order.orderProducts', 'orderProducts')
    .leftJoinAndSelect('orderProducts.product', 'product')
    .where('order.status = :status', { status: 'pendiente' })
    .orderBy('order.createdAt', 'ASC')
    .getMany();

  console.log('🔍 Órdenes traídas:', orders.length);
  if (orders.length > 0) {
    console.log('📝 Primera orden detalle_venta:', orders[0].detalle_venta);
  }

  // Agrupar por mesa, igual que getMesaDetail
  const mesasMap = new Map<number, any>();

  for (const order of orders) {
    const mesaId = order.mesaId ?? 0; // 0 para delivery/sin mesa

    if (!mesasMap.has(mesaId)) {
      mesasMap.set(mesaId, {
        mesaId,
        mesa: order.mesa,
        customer: order.customer,
        orderType: order.orderType,
        orders: [],
        neto: 0,  // ✅ Inicializar en 0 para acumular
        detalle: new Map<number, any>(),
      });
    }

    const mesa = mesasMap.get(mesaId);
    mesa.orders.push(order);

    // ✅ Agrupar productos y acumular neto
    for (const op of order.orderProducts) {
      const prodId = op.productId;
      const precioUnit = Number(op.precioUnitario);
      const subtotal = Number(op.subtotal);

      // Acumular neto sumando todos los subtotales
      mesa.neto += subtotal;

      // Crear una clave única que incluya productId y precioUnitario
      // para agrupar solo productos con el mismo precio
      const key = `${prodId}_${precioUnit}`;

      if (mesa.detalle.has(key)) {
        const existing = mesa.detalle.get(key);
        existing.cantidad += Number(op.cantidad);
        existing.subtotal += subtotal;
      } else {
        mesa.detalle.set(key, {
          productId: prodId,
          producto: op.product?.name || 'Producto no disponible',
          precioUnitario: precioUnit,
          cantidad: Number(op.cantidad),
          subtotal: subtotal,
        });
      }
    }
  }

  // Convertir Maps a arrays para el response
  return Array.from(mesasMap.values()).map((mesa) => {
    // ✅ Recalcular propina como 10% del neto total (no acumular propinas individuales)
    const propinaCalculada = Math.round(mesa.neto * 0.10);

    // ✅ Obtener costo_delivery de la primera orden (todas las órdenes de la misma mesa deberían tener el mismo costo)
    const costoDelivery = mesa.orderType === 'delivery' && mesa.orders.length > 0
      ? (mesa.orders[0].costo_delivery ?? 0)
      : 0;

    const totalMesa = mesa.neto + propinaCalculada + costoDelivery;

    // ✅ Obtener detalles_venta (comentarios) concatenados si hay múltiples órdenes
    const detallesArray = mesa.orders.map(o => o.detalle_venta);
    console.log(`📋 Mesa ${mesa.mesaId} - detalles raw:`, detallesArray);

    const detalles_venta = mesa.orders
      .map(o => o.detalle_venta)
      .filter(d => d && d.trim() !== '')
      .join(' | ');

    console.log(`📋 Mesa ${mesa.mesaId} - detalles después filtro:`, detalles_venta);

    return {
      mesaId: mesa.mesaId,
      mesa: mesa.mesa,
      customer: mesa.customer,
      orderType: mesa.orderType,
      orderIds: mesa.orders.map((o) => o.id),
      detalle: Array.from(mesa.detalle.values()),
      detalle_venta: detalles_venta || null,  // ✅ Incluir comentarios/detalles
      neto: mesa.neto,
      propina: propinaCalculada,  // ✅ Propina recalculada como 10% del neto total
      costo_delivery: costoDelivery,  // ✅ Incluir costo de delivery
      totalMesa: totalMesa,
    };
  });
}

  async aceptarVenta(orderId: number): Promise<Order> {
    console.log('🔍 ORDERS SERVICE: aceptarVenta llamado con orderId:', orderId);
    
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['mesa', 'customer', 'orderProducts', 'orderProducts.product']
    });

    console.log('🔍 ORDERS SERVICE: Orden encontrada:', !!order);
    if (order) {
      console.log('🔍 ORDERS SERVICE: Orden ID:', order.id);
      console.log('🔍 ORDERS SERVICE: Orden numeroVenta:', order.numeroVenta);
      console.log('🔍 ORDERS SERVICE: Orden customer:', order.customer);
    }

    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Si aceptar = pagar, entonces lo marcas como pagado
    order.status = 'aceptado';
    order.paymentMethod = order.paymentMethod ?? 'efectivo'; // o lo que uses
    await this.orderRepository.save(order);

    const mesa = order.mesa;
    if (mesa) {
      mesa.status = 'Libre';
      await this.mesaRepository.save(mesa);
      this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
    }

    // Enviar email de confirmación si hay cliente con email
    console.log('🔍 DEBUG: Verificando si se debe enviar email...');
    console.log('🔍 DEBUG: Order customer:', order.customer);
    console.log('🔍 DEBUG: Customer email:', order.customer?.customerEmail);
    
    if (order.customer && order.customer.customerEmail) {
      console.log('📧 DEBUG: Enviando email a:', order.customer.customerEmail);
      try {
        const productsForEmail = order.orderProducts.map(op => ({
          name: op.product?.name || 'Producto desconocido',
          cantidad: op.cantidad,
          price: op.subtotal,
        }));

        console.log('📧 DEBUG: Preparando datos de email...');
        console.log('📧 DEBUG: Order data:', {
          customerEmail: order.customer.customerEmail,
          customerName: order.customer.customerName,
          numeroVenta: order.numeroVenta,
          orderType: order.orderType,
          productsCount: productsForEmail.length,
          total: order.total,
        });

        await this.mailService.sendOrderConfirmation({
          customerEmail: order.customer.customerEmail,
          customerName: order.customer.customerName,
          numeroVenta: order.numeroVenta,
          fecha: new Date().toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          orderType: order.orderType === 'delivery' ? 'Envío a domicilio' : order.orderType || 'Local',
          customerAddress: order.customer?.customerAddress || undefined,
          tiempoEstimado: undefined, // No aplica para pedidos locales
          products: productsForEmail,
          subtotal: order.neto,
          costoEnvio: order.costo_delivery || 0,
          total: order.total,
        });
        
        console.log('✅ DEBUG: Email enviado exitosamente');
      } catch (error) {
        console.error('❌ DEBUG: Error al enviar email al aceptar pedido, pero el pedido se aceptó correctamente:', error);
      }
    } else {
      console.log('⚠️ DEBUG: No se envía email - no hay cliente o email del cliente');
    }

    return order;
  }


  async pendienteVenta(orderId: number): Promise<Order> {
    console.log('🔍 ORDERS SERVICE: pendienteVenta llamado con orderId:', orderId);
    
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['mesa', 'customer', 'orderProducts', 'orderProducts.product']
    });

    console.log('🔍 ORDERS SERVICE: Orden encontrada:', !!order);
    if (order) {
      console.log('🔍 ORDERS SERVICE: Orden ID:', order.id);
      console.log('🔍 ORDERS SERVICE: Orden numeroVenta:', order.numeroVenta);
      console.log('🔍 ORDERS SERVICE: Orden customer:', order.customer);
    }

    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Si aceptar = pagar, entonces lo marcas como pagado
    order.status = 'pendiente';
    order.paymentMethod = order.paymentMethod ?? 'efectivo'; // o lo que usa
    await this.orderRepository.save(order);

    const mesa = order.mesa;
    if (mesa) {
      mesa.status = 'Libre';
      await this.mesaRepository.save(mesa);
      this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
    }

    // Enviar email de confirmación si hay cliente con email
    console.log('🔍 DEBUG: Verificando si se debe enviar email...');
    console.log('🔍 DEBUG: Order customer:', order.customer);
    console.log('🔍 DEBUG: Customer email:', order.customer?.customerEmail);
    
    if (order.customer && order.customer.customerEmail) {
      console.log('📧 DEBUG: Enviando email a:', order.customer.customerEmail);
      try {
        const productsForEmail = order.orderProducts.map(op => ({
          name: op.product?.name || 'Producto desconocido',
          cantidad: op.cantidad,
          price: op.subtotal,
        }));

        console.log('📧 DEBUG: Preparando datos de email...');
        console.log('📧 DEBUG: Order data:', {
          customerEmail: order.customer.customerEmail,
          customerName: order.customer.customerName,
          numeroVenta: order.numeroVenta,
          orderType: order.orderType,
          productsCount: productsForEmail.length,
          total: order.total,
        });

        await this.mailService.sendOrderConfirmation({
          customerEmail: order.customer.customerEmail,
          customerName: order.customer.customerName,
          numeroVenta: order.numeroVenta,
          fecha: new Date().toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          orderType: order.orderType === 'delivery' ? 'Envío a domicilio' : order.orderType || 'Local',
          customerAddress: order.customer?.customerAddress || undefined,
          tiempoEstimado: undefined, // No aplica para pedidos locales
          products: productsForEmail,
          subtotal: order.neto,
          costoEnvio: order.costo_delivery || 0,
          total: order.total,
        });
        
        console.log('✅ DEBUG: Email enviado exitosamente');
      } catch (error) {
        console.error('❌ DEBUG: Error al enviar email al aceptar pedido, pero el pedido se aceptó correctamente:', error);
      }
    } else {
      console.log('⚠️ DEBUG: No se envía email - no hay cliente o email del cliente');
    }

    return order;
  }











  async cancelarVenta(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['mesa'], // ✅ Para traer la mesa asociada
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // ✅ Cambiar estado del pedido
    order.status = 'cancelado';
    await this.orderRepository.save(order);

    // ✅ Verificamos si hay mesa asociada
    if (order.mesa) {
      order.mesa.status = 'Disponible'; // ✅ Liberar mesa
      await this.mesaRepository.save(order.mesa);
    }

    return order;
  }

  // Actualizar estado de una orden
  async actualizarEstado(orderId: number, nuevoEstado: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['mesa']
    });

    if (!order) {
      throw new NotFoundException(`Orden con ID ${orderId} no encontrada`);
    }

    // Actualizar el estado
    order.status = nuevoEstado;
    await this.orderRepository.save(order);

    // Si el estado es 'pagado', liberar la mesa
    if (nuevoEstado === 'pagado' && order.mesa) {
      order.mesa.status = 'Disponible';
      await this.mesaRepository.save(order.mesa);
      this.ordersGateway.notifyMesaUpdated(order.mesa.id, order.mesa.status);
    }

    return order;
  }

  async getVentasDiarias(desde?: string, hasta?: string, orderType?: string) {
    let inicio: Date;
    let fin: Date;

    if (!desde && !hasta) {
      const hoy = new Date();
      inicio = new Date(hoy.setHours(0, 0, 0, 0));
      fin = new Date(hoy.setHours(23, 59, 59, 999));
    } else {
      inicio = new Date(desde);
      fin = new Date(hasta);
    }

    // 🧾 1️⃣ Totales generales (incluye total y propinas)
    const totalesQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total_ventas')
      .addSelect('SUM(order.propina)', 'total_propinas')
      .addSelect('COUNT(order.id)', 'cantidad_pedidos')
      .where('order.status = :status', { status: 'pagado' })
      .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });

    if (orderType) {
      totalesQuery.andWhere('order.orderType = :orderType', { orderType });
    }

    const totales = await totalesQuery.getRawOne();

    // 📊 2️⃣ Gráfico por hora (suma total y propina opcional)
    const graficoQuery = this.orderRepository
      .createQueryBuilder('order')
      .select("DATE_FORMAT(order.createdAt, '%H:00')", 'hora')
      .addSelect('SUM(order.total)', 'total')
      .addSelect('SUM(order.propina)', 'propina')
      .where('order.status = :status', { status: 'pagado' })
      .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin })
      .groupBy('hora')
      .orderBy('hora', 'ASC');

    if (orderType) {
      graficoQuery.andWhere('order.orderType = :orderType', { orderType });
    }

    const grafico = await graficoQuery.getRawMany();

    // 🧾 3️⃣ Detalle de ventas individuales (incluye propina)
    const detallesQuery = this.orderRepository
      .createQueryBuilder('order')
      .select([
        'order.id AS id',
        'order.total AS total',
        'order.propina AS propina',
        'order.orderType AS orderType',
        'order.paymentMethod AS paymentMethod',
        'order.createdAt AS createdAt',
        'mesa.numero_mesa AS numero_mesa',
      ])
      .leftJoin('order.mesa', 'mesa')
      .where('order.status = :status', { status: 'pagado' })
      .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin })
      .orderBy('order.createdAt', 'DESC');

    if (orderType) {
      detallesQuery.andWhere('order.orderType = :orderType', { orderType });
    }

    const detalles = await detallesQuery.getRawMany();

    // 📋 4️⃣ Respuesta final
    return {
      totalVentas: Number(totales?.total_ventas || 0),
      totalPropinas: Number(totales?.total_propinas || 0),
      cantidadPedidos: Number(totales?.cantidad_pedidos || 0),
      rango: { desde: inicio, hasta: fin },
      grafico,
      detalles,
    };
  }

 async getVentasDiariasxMesa(desde?: string, hasta?: string, mesaId?: number) {
    let inicio: Date;
    let fin: Date;

    // 1. Definimos claramente la lista de estados permitidos
    const estadosPermitidos = ['pagado', 'pendiente', 'cancelado'];

    if (!desde && !hasta) {
      const diaDeHoy = new Date();
      inicio = new Date(diaDeHoy);
      inicio.setHours(0, 0, 0, 0);

      fin = new Date(diaDeHoy);
      fin.setHours(23, 59, 59, 999);
    } else {
      // Corrección importante: Asegurar que las fechas string se conviertan bien
      inicio = new Date(desde);
      inicio.setHours(0, 0, 0, 0); // Asegura inicio del día

      fin = new Date(hasta);
      fin.setHours(23, 59, 59, 999); // Asegura que tome TODO el día final
    }

    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.mesa', 'mesa')
      // 2. Aquí aplicamos la lista de estados definida arriba
      .where('order.status IN (:...statuses)', { statuses: estadosPermitidos })
      .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });

    if (mesaId) {
      query.andWhere('order.mesaId = :mesaId', { mesaId });
    }

    const ventas = await query
      .select([
        'order.id AS id',
        'order.total AS total',
        'order.neto AS neto',
        'order.propina AS propina',
        'order.status AS estado',
        'order.orderType AS tipo',
        'order.paymentMethod AS metodo',
        'mesa.numero_mesa AS mesa',
        'order.createdAt AS fecha',
      ])
      .orderBy('order.createdAt', 'DESC')
      .getRawMany();

    return ventas;
}
  // 🔹 Cancelar ventas
  async cancelarVentas(fecha?: string, mesaId?: number) {
    const query = this.orderRepository.createQueryBuilder('order')
      .update()
      .set({ status: 'cancelado' });

    if (fecha) {
      const inicio = new Date(`${fecha}T00:00:00`);
      const fin = new Date(`${fecha}T23:59:59`);
      query.where('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });
    }

    if (mesaId) {
      if (fecha) {
        query.andWhere('order.mesaId = :mesaId', { mesaId });
      } else {
        query.where('order.mesaId = :mesaId', { mesaId });
      }
    }

    const result = await query.execute();

    return {
      message: 'Ventas canceladas correctamente',
      afectadas: result.affected,
    };
  }

  async cancelar(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('La venta no existe');
    }

    if (order.status === 'cancelado') {
      throw new BadRequestException('La venta ya está cancelada');
    }

    order.status = 'cancelado';
    await this.orderRepository.save(order);

    return { message: `Venta ${id} cancelada correctamente` };
  }



  private sanitizeOrder(order: Order): any {
    if (!order) return null;

    return {
      id: order.id,
      tableNumber: order.tableNumber ?? null,
      orderType: order.orderType ?? 'local',
      detalle_venta: order.detalle_venta ?? null,
      estado: order.estado ?? 'activo',
      propina: order.propina ?? 0,
      costo_delivery: order.costo_delivery ?? 0,
      status: order.status ?? 'pendiente',
      total: order.total ?? 0,
      createdAt: order.createdAt ?? new Date(),
      paymentMethod: order.paymentMethod ?? 'pendiente',
      numeroVenta: order.numeroVenta ?? null,
      orderProducts: order.orderProducts, // 👈 ¡Asegúrate
      // Mesa simplificada
      mesaId: order.mesa?.id ?? null,
      mesa: order.mesa
        ? {
          id: order.mesa.id,
          numero_mesa: order.mesa.numero_mesa,
          status: order.mesa.status,
        }
        : null,

      // Cliente
      customer: order.customer
        ? {
          id: order.customer.id,
          name: order.customer.customerName,
          email: order.customer.customerEmail,
          phone: order.customer.customerPhone,
        }
        : null,

      // Productos
      items: order.orderProducts?.map(op => ({
        name: op.product?.name || 'Producto desconocido',
        cantidad: op.cantidad,
        precio: op.precioUnitario,
        subtotal: op.subtotal,
        imageUrl: op.product?.imageUrl ?? null,
      })) ?? [],
    };
  }


  private async generarNumeroVenta(): Promise<number> {
    try {
      console.log('   ↳ Ejecutando query MAX(numeroVenta)...');

      const { max } = await this.orderRepository
        .createQueryBuilder('order')
        .select('MAX(order.numeroVenta)', 'max')
        .getRawOne();

      console.log(`   ↳ Resultado RAW MAX:`, max);

      const parsed = parseInt(max, 10);

      if (isNaN(parsed)) {
        this.logger.error(`❌ MAX(numeroVenta) devolvió valor inválido: ${max}`);
        return 1;
      }

      return parsed + 1;
    } catch (error) {
      this.logger.error('❌ Error en generarNumeroVenta:', error);
      throw error;
    }
  }


  async getById(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        orderProducts: {
          product: true,
        },
        customer: true,
        mesa: true,
      }
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return this.sanitizeOrder(order);
  }

  // ==========================================
  // 🔹 Métodos CRUD específicos para Mesa
  // ==========================================

  /**
   * Crear una orden para una mesa específica
   */
  async crearOrdenPorMesa(mesaId: number, createOrderDto: CreateOrderDto) {
    // Validar que la mesa existe
    const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
    }

    // Verificar si ya existe una orden activa para esta mesa (no cerrada)
    const ordenActiva = await this.orderRepository.findOne({
      where: [
        { mesa: { id: mesaId }, estado: 'activo' },
        { mesa: { id: mesaId }, estado: 'pendiente' },
        { mesa: { id: mesaId }, status: 'pendiente' }
      ],
      relations: ['orderProducts']
    });

    if (ordenActiva) {
      // Si ya existe una orden activa, agregar los productos a esa orden
      const { products } = createOrderDto;
      if (products && products.length > 0) {
        // Mapear productos al formato esperado por agregarProductosAOrden
        const productosParaAgregar = products.map(p => ({
          productId: p.id,
          cantidad: p.cantidad
        }));
        return this.agregarProductosAOrden(mesaId, ordenActiva.id, productosParaAgregar);
      }
      return ordenActiva;
    }

    // Asignar el mesaId al DTO
    createOrderDto.mesaId = mesaId;

    // Usar el método create existente
    return this.create(createOrderDto);
  }

  /**
   * Obtener todas las órdenes de una mesa específica
   * @param mesaId - ID de la mesa
   * @param estado - Opcional: filtrar por estado ('activo', 'pendiente', 'cancelado')
   * @param agrupar - Opcional: true para consolidar todas las órdenes en una sola
   */
  async obtenerOrdenesPorMesa(
    mesaId: number,
    estado?: string,
    fecha?: string,
    horaInicio?: string,
    horaFin?: string,
    agrupar?: boolean,
  ) {
    // Validar que la mesa existe
    const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
    }

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderProducts', 'orderProducts')
      .leftJoinAndSelect('orderProducts.product', 'product')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.mesa', 'mesa')
      .where('order.mesaId = :mesaId', { mesaId })
      .orderBy('order.createdAt', 'DESC');

    // Filtro opcional por status (pendiente, pagado, etc.)
    if (estado) {
      queryBuilder.andWhere('order.status = :estado', { estado });
    }

    // Filtro opcional por fecha (día específico)
    if (fecha) {
      // Convertir fecha a formato YYYY-MM-DD si es necesario
      const fechaObj = new Date(fecha);
      if (!isNaN(fechaObj.getTime())) {
        const year = fechaObj.getFullYear();
        const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaObj.getDate()).padStart(2, '0');
        const fechaFiltro = `${year}-${month}-${day}`;

        queryBuilder.andWhere('DATE(order.createdAt) = :fecha', { fecha: fechaFiltro });
      }
    }

    // Filtro opcional por rango de horas
    if (horaInicio && horaFin) {
      queryBuilder.andWhere(
        'TIME(order.createdAt) BETWEEN :horaInicio AND :horaFin',
        { horaInicio, horaFin }
      );
    } else if (horaInicio) {
      queryBuilder.andWhere('TIME(order.createdAt) >= :horaInicio', { horaInicio });
    } else if (horaFin) {
      queryBuilder.andWhere('TIME(order.createdAt) <= :horaFin', { horaFin });
    }

    const ordenes = await queryBuilder.getMany();

    // Si agrupar=true, consolidar todas las órdenes en una sola respuesta
    if (agrupar && ordenes.length > 0) {
      let netoTotal = 0;
      const productosMap = new Map<string, any>();
      const orderIds: number[] = [];

      // Consolidar todos los productos de todas las órdenes
      for (const orden of ordenes) {
        orderIds.push(orden.id);

        for (const op of orden.orderProducts) {
          const prodId = op.productId;
          const precioUnit = Number(op.precioUnitario);
          const key = `${prodId}_${precioUnit}`;

          netoTotal += Number(op.subtotal) || 0;

          if (productosMap.has(key)) {
            const existing = productosMap.get(key);
            existing.cantidad += Number(op.cantidad);
            existing.subtotal += Number(op.subtotal);
          } else {
            productosMap.set(key, {
              id: op.product?.id,
              nombre: op.product?.name,
              precioUnitario: precioUnit,
              cantidad: Number(op.cantidad),
              subtotal: Number(op.subtotal),
            });
          }
        }
      }

      // Calcular propina del 10% del neto total
      const propinaCalculada = Math.round(netoTotal * 0.10);
      const totalFinal = netoTotal + propinaCalculada;

      // Preparar respuesta consolidada
      const respuesta = {
        mesaId,
        mesa: ordenes[0].mesa,
        customer: ordenes[0].customer,
        orderType: ordenes[0].orderType,
        orderIds,
        detalle: Array.from(productosMap.values()),
        neto: netoTotal,
        propina: propinaCalculada,
        totalMesa: totalFinal,
      };

      // ✅ Emitir por WebSocket para actualizaciones en tiempo real
      this.ordersGateway.notifyMesaOrdenesUpdated(mesaId, respuesta);

      return respuesta;
    }

    // Si no agrupar, retornar órdenes individuales con su detalle
    const ordenesConDetalle = ordenes.map(orden => {
      // Calcular neto (suma de productos)
      const neto = orden.orderProducts.reduce(
        (sum, op) => sum + (op.subtotal || 0),
        0
      );

      // Calcular propina del 10% del neto
      const propinaSugerida10 = Math.round(neto * 0.10);

      return {
        ...orden,
        detalle: {
          neto,
          propinaActual: orden.propina || 0,
          propinaSugerida10, // 10% calculado
          totalConPropinaSugerida: neto + propinaSugerida10,
          totalActual: orden.total || 0,
        },
        productos: orden.orderProducts.map(op => ({
          id: op.product?.id,
          nombre: op.product?.name,
          cantidad: op.cantidad,
          precioUnitario: op.precioUnitario,
          subtotal: op.subtotal,
        })),
      };
    });

    // ✅ Emitir por WebSocket también para órdenes individuales
    this.ordersGateway.notifyMesaOrdenesUpdated(mesaId, ordenesConDetalle);

    return ordenesConDetalle;
  }

  /**
   * Obtener una orden específica de una mesa
   */
  async obtenerOrdenEspecifica(mesaId: number, ordenId: number) {
    // Validar que la mesa existe
    const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
    }

    // Buscar la orden
    const orden = await this.orderRepository.findOne({
      where: { id: ordenId, mesaId },
      relations: {
        orderProducts: {
          product: true,
        },
        customer: true,
        mesa: true,
      }
    });

    if (!orden) {
      throw new NotFoundException(
        `Orden con ID ${ordenId} no encontrada para la mesa ${mesaId}`
      );
    }

    return this.sanitizeOrder(orden);
  }

  /**
   * Actualizar una orden específica de una mesa
   */
  async actualizarOrdenPorMesa(
    mesaId: number,
    ordenId: number,
    updateOrderDto: UpdateOrderDto
  ) {
    // Validar que la mesa existe
    const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
    }

    // Validar que la orden existe y pertenece a la mesa
    const orden = await this.orderRepository.findOne({
      where: { id: ordenId, mesaId },
      relations: ['mesa'],
    });

    if (!orden) {
      throw new NotFoundException(
        `Orden con ID ${ordenId} no encontrada para la mesa ${mesaId}`
      );
    }

    // Usar el método update existente
    return this.update(ordenId, updateOrderDto);
  }

  /**
   * Cancelar un producto de una orden específica (soft delete)
   */
  async cancelarProducto(mesaId: number, ordenId: number, productId: number) {
    // Validar que la mesa existe
    const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
    }

    // Validar que la orden existe y pertenece a la mesa
    const orden = await this.orderRepository.findOne({
      where: { id: ordenId, mesaId },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!orden) {
      throw new NotFoundException(
        `Orden con ID ${ordenId} no encontrada para la mesa ${mesaId}`
      );
    }

    // Buscar el producto en la orden
    const orderProduct = await this.productsOrdersRepository.findOne({
      where: { orderId: ordenId, productId },
    });

    if (!orderProduct) {
      throw new NotFoundException(
        `Producto con ID ${productId} no encontrado en la orden ${ordenId}`
      );
    }

    // Verificar si ya está cancelado
    if (orderProduct.deletedAt) {
      throw new BadRequestException('El producto ya está cancelado');
    }

    // Soft delete del producto
    await this.productsOrdersRepository.softRemove(orderProduct);

    // Obtener productos restantes (no cancelados)
    const remainingProducts = await this.productsOrdersRepository.find({
      where: { orderId: ordenId },
    });

    // Recalcular total
    const newTotal = remainingProducts.reduce((sum, op) => sum + op.subtotal, 0);

    // Actualizar orden
    orden.total = newTotal + (orden.propina || 0);

    // Si no quedan productos activos, marcar la orden
    if (remainingProducts.length === 0) {
      orden.status = 'vacío';
      orden.propina = 0;
      orden.total = 0;
    }

    await this.orderRepository.save(orden);

    // Retornar orden actualizada completa
    const updatedOrder = await this.orderRepository.findOne({
      where: { id: ordenId },
      relations: {
        orderProducts: {
          product: true,
        },
        customer: true,
        mesa: true,
      }
    });

    return this.sanitizeOrder(updatedOrder);
  }

  async agregarProductosAOrden(mesaId: number, ordenId: number, productos: { productId: number; cantidad: number }[]) {
    console.log(`=== agregarProductosAOrden ===`);
    console.log(`mesaId: ${mesaId}, ordenId: ${ordenId}`);
    console.log('Productos:', productos);

    // 1. Primero buscar si hay una orden activa para la mesa (ignorando el ordenId recibido)
    const ordenActiva = await this.orderRepository.findOne({
      where: { mesaId: mesaId, status: 'pendiente' },
      relations: ['orderProducts', 'orderProducts.product'],
      order: { createdAt: 'DESC' }
    });

    if (ordenActiva) {
      console.log(`Encontrada orden activa ${ordenActiva.id}, agregando productos a ella`);
      // Agregar productos a la orden activa existente
      for (const item of productos) {
        if (!item) continue;
        const producto = await this.productRepository.findOne({ where: { id: item.productId } });
        if (!producto) continue;

        let orderProduct = ordenActiva.orderProducts.find((op) => op.productId === item.productId);
        if (orderProduct) {
          // Reemplazar cantidad (el frontend envía la cantidad total, no el delta)
          orderProduct.cantidad = item.cantidad;
          orderProduct.subtotal = orderProduct.cantidad * producto.price;
          if (orderProduct.cantidad <= 0) {
            await this.productsOrdersRepository.remove(orderProduct);
          } else {
            await this.productsOrdersRepository.save(orderProduct);
          }
        } else {
          // Agregar nuevo producto
          if (item.cantidad > 0) {
            const newOrderProduct = this.productsOrdersRepository.create({
              orderId: ordenActiva.id,
              productId: item.productId,
              cantidad: item.cantidad,
              precioUnitario: producto.price,
              subtotal: item.cantidad * producto.price,
            });
            await this.productsOrdersRepository.save(newOrderProduct);
          }
        }
      }

      // Recargar productos de la orden para tener el array actualizado
      const ordenActualizada = await this.orderRepository.findOne({
        where: { id: ordenActiva.id },
        relations: ['orderProducts', 'orderProducts.product'],
      });

      // Recalcular neto y total de la orden activa
      const newNeto = ordenActualizada.orderProducts.reduce((sum, op) => sum + op.subtotal, 0);
      const newPropina = Math.round(newNeto * 0.10); // 10% del neto
      ordenActualizada.neto = newNeto;
      ordenActualizada.propina = newPropina;
      ordenActualizada.total = newNeto + newPropina;
      await this.orderRepository.save(ordenActualizada);

      console.log(`Orden ${ordenActualizada.id} actualizada: neto=${newNeto}, propina=${newPropina}, total=${ordenActualizada.total}`);

      // Retornar orden actualizada
      const updatedOrder = await this.orderRepository.findOne({
        where: { id: ordenActiva.id },
        relations: { orderProducts: { product: true }, customer: true, mesa: true }
      });
      return this.sanitizeOrder(updatedOrder);
    }

    // 2. Si no hay orden activa, crear una nueva orden
    console.log(`No hay orden activa, creando nueva orden para la mesa ${mesaId}`);
    const productsForCreate = productos.map(p => ({ id: p.productId, cantidad: p.cantidad }));
    return this.create({
      mesaId,
      orderType: 'local',
      products: productsForCreate
    } as any);
  }

}


