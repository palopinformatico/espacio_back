import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, ParseIntPipe, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AgregarProductosDto, CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateSOrderDto } from './dto/create.sorder';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Between, Raw, Repository } from 'typeorm';
import { PrintService } from './print/print.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, @InjectRepository(Order)
  private readonly orderRepository: Repository<Order>,
    private readonly printService: PrintService
  ) { }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    console.log('🔷 CONTROLLER - PATCH recibido para orden ID:', id);
    console.log('🔷 DTO recibido:', updateOrderDto);
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Get('pendientes')
  async obtenerPendientes() {
    return this.ordersService.obtenerPendientes();
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getById(id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('historial/:mesaId')
  async getHistorialPorMesa(
    @Param('mesaId') mesaId: number,
    @Query('fecha') fecha?: string
  ) {
    console.log('🧩 Mesa ID recibido:', mesaId, 'Fecha:', fecha);
    return this.ordersService.getHistorialPorMesa(+mesaId, fecha);
  }


  @Post('s')
  creates(@Body() createOrderDto: CreateSOrderDto) {
    return this.ordersService.creates(createOrderDto);
  }

  @Get(':id/detail')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Patch(':id/cancelar')
  cancelarOrden(@Param('id') id: number) {
    return this.ordersService.cancelarOrden(id);
  }

  @Get('ventas/por-dia')
  async obtenerVentasPorDia(@Query('fecha') fecha: string) {
    if (!fecha) {
      throw new BadRequestException('Debe proporcionar una fecha en formato YYYY-MM-DD');
    }

    const ordenes = await this.orderRepository.find({
      where: {
        createdAt: Raw(alias => `DATE(${alias}) = :fecha`, { fecha })
      },
      order: { id: 'DESC' }
    });

    const ordenesConTotal = ordenes.map(orden => ({
      id: orden.id,
      fecha: orden.createdAt,
      status: orden.status,
      neto: orden.neto,
      propina:orden.propina,
      total: orden.total
    }));

    return ordenesConTotal;
  }




  @Delete(':orderId/productos/:productId')
  async eliminarProducto(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.ordersService.eliminarProducto(orderId, productId);

  }

  @Post('imprimir/factura')
  async print(@Body() body: any) {
    return this.printService.printFactura(body);
  }

  // Aceptar una venta (cambia status => 'Aceptado')
  @Patch(':id/aceptar')
  async aceptarVenta(@Param('id') id: number) {
    return this.ordersService.aceptarVenta(+id);
  }

  @Patch(':id/pendiente')
  async pendienteVenta(@Param('id') id: number) {
    return this.ordersService.pendienteVenta(+id);
  }

  // Cancelar venta (opcional) - status => 'cancelado' o 'Anulado'
  @Patch(':id/cancelar')
  async cancelarVenta(@Param('id') id: number) {
    return this.ordersService.cancelarVenta(+id);
  }

  // Actualizar estado de una orden
  @Patch(':id/estado')
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: string }
  ) {
    const estadosPermitidos = ['pagado', 'pendiente'];

    if (!estadosPermitidos.includes(body.estado)) {
      throw new BadRequestException('El estado debe ser "pagado" o "pendiente"');
    }

    return this.ordersService.actualizarEstado(id, body.estado);
  }

  @Get('ventas/diarias')
  async getVentasDiarias(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('orderType') orderType?: string,
  ) {
    return this.ordersService.getVentasDiarias(desde, hasta, orderType);
  }

  @Get('ventas/diariasMesa')
  async getVentasDiariasxMesa(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('mesaId') mesaId?: number,
  ) {
    return this.ordersService.getVentasDiariasxMesa(desde, hasta, mesaId);
  }

  @Patch('cancelar')
  async cancelarVentas(
    @Query('fecha') fecha?: string, // formato YYYY-MM-DD
    @Query('mesaId') mesaId?: number,
  ) {
    if (!fecha && !mesaId) {
      throw new BadRequestException('Debe especificar al menos una fecha o una mesa.');
    }

    return this.ordersService.cancelarVentas(fecha, mesaId);
  }



  @Patch(':id/cancelar')
  async cancelar(@Param('id') id: number) {
    return this.ordersService.cancelar(id);
  }

  // ==========================================
  // 🔹 CRUD específico para Mesa
  // ==========================================

  /**
   * Crear una orden para una mesa específica
   * POST /orders/mesa/:mesaId
   */
  @Post('mesa/:mesaId')
  async crearOrdenPorMesa(
    @Param('mesaId', ParseIntPipe) mesaId: number,
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.ordersService.crearOrdenPorMesa(mesaId, createOrderDto);
  }

  /**
   * Obtener todas las órdenes de una mesa específica
   * GET /orders/mesa/:mesaId
   * Query params opcionales:
   *  - estado: filtrar por estado de la orden
   *  - fecha: filtrar por día específico (formato: YYYY-MM-DD)
   *  - horaInicio: filtrar desde hora específica (formato: HH:MM:SS)
   *  - horaFin: filtrar hasta hora específica (formato: HH:MM:SS)
   *  - agrupar: true para consolidar todas las órdenes en una sola respuesta
   */
  @Get('mesa/:mesaId')
  async obtenerOrdenesPorMesa(
    @Param('mesaId', ParseIntPipe) mesaId: number,
    @Query('estado') estado?: string,
    @Query('fecha') fecha?: string,
    @Query('horaInicio') horaInicio?: string,
    @Query('horaFin') horaFin?: string,
    @Query('agrupar') agrupar?: string,
  ) {
    return this.ordersService.obtenerOrdenesPorMesa(
      mesaId,
      estado,
      fecha,
      horaInicio,
      horaFin,
      agrupar === 'true',
    );
  }

  /**
   * Obtener una orden específica de una mesa
   * GET /orders/mesa/:mesaId/orden/:ordenId
   */
  @Get('mesa/:mesaId/orden/:ordenId')
  async obtenerOrdenEspecifica(
    @Param('mesaId', ParseIntPipe) mesaId: number,
    @Param('ordenId', ParseIntPipe) ordenId: number
  ) {
    return this.ordersService.obtenerOrdenEspecifica(mesaId, ordenId);
  }

  /**
   * Actualizar una orden específica de una mesa
   * PATCH /orders/mesa/:mesaId/orden/:ordenId
   */
  @Patch('mesa/:mesaId/orden/:ordenId')
  async actualizarOrdenPorMesa(
    @Param('mesaId', ParseIntPipe) mesaId: number,
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return this.ordersService.actualizarOrdenPorMesa(mesaId, ordenId, updateOrderDto);
  }

  /**
   * Cancelar un producto específico de una orden (soft delete)
   * PATCH /orders/mesa/:mesaId/orden/:ordenId/producto/:productId/cancelar
   */
  @Patch('mesa/:mesaId/orden/:ordenId/producto/:productId/cancelar')
  async cancelarProducto(
    @Param('mesaId', ParseIntPipe) mesaId: number,
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Param('productId', ParseIntPipe) productId: number
  ) {
    return this.ordersService.cancelarProducto(mesaId, ordenId, productId);
  }

  @Post('mesa/:mesaId/orden/:ordenId/productos')
  async agregarProductosAOrden(
    @Param('mesaId', ParseIntPipe) mesaId: number,
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Body() dto: AgregarProductosDto,
  ) {
    return this.ordersService.agregarProductosAOrden(mesaId, ordenId, dto.productos);
  }

}