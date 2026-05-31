import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { Gasto } from './entities/gasto.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { RangoFechaDto } from './dto/rango-fecha.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('gastos')
export class GastosController {
  constructor(private readonly expensesService: GastosService) { }

  @Get('estadisticas')
  async estadisticas(
    @Query('periodo') periodo: 'dia' | 'mes' | 'anio',
    @Query('valor') valor: string
  ) {
    return this.expensesService.estadisticas({ periodo, valor });
  }

  @Get('mensual')
  async getMensual(
    @Query('anio') anio: string,
    @Query('mes') mes: string,
  ) {
    const year = Number(anio);
    const month = Number(mes);

    if (isNaN(year) || isNaN(month)) {
      throw new BadRequestException('Año o mes inválido');
    }

    return this.expensesService.getBalanceMensual(year, month);
  }


  @Get('anual')
  async getAnual(
    @Query('anio') anio: string,
  ) {
    const year = Number(anio);

    if (isNaN(year)) {
      throw new BadRequestException('Año inválido');
    }

    return this.expensesService.getBalanceAnual(year);
  }



  @Get('balances')
  async getBalance(
    @Query('start') startDate?: string,
    @Query('end') endDate?: string
  ) {
    return this.expensesService.getBalancePorFecha(startDate, endDate);
  }


  @Get('balancesA')
  async getBalancePorAnio(@Query('anio') anio?: number) {
    return this.expensesService.getBalancePorAnio(anio);
  }

  @Get('ventas-diarias')
  async getBalanceDiario(@Query('fecha') fecha: string) {
    if (!fecha) {
      throw new BadRequestException('La fecha es requerida en formato YYYY-MM-DD');
    }
    return this.expensesService.getBalanceDiario(fecha);
  }



@UseGuards(AuthGuard('jwt'))
  @Get()
  getAll(@Req() req) {
    return this.expensesService.findAll(req.user);
  }

  @Get(':id')
  getOne(@Param('id') id: number): Promise<Gasto> {
    return this.expensesService.findOne(id);
  }

@Post()
@UseGuards(AuthGuard('jwt')) // Importante para tener req.user
create(@Body() createGastoDto: CreateGastoDto, @Req() req) {
  // Pasamos el DTO (datos) y el USER (quién lo hace)
  return this.expensesService.crearGastoManual(createGastoDto, req.user);
}

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.expensesService.remove(id);
  }

  // ==========================================
  // CONTABILIDAD - FINANZAS
  // ==========================================

  @Get('contabilidad/finanzas/kpis')
  async getKpisFinanzas(@Query() rango: RangoFechaDto) {
    return this.expensesService.getKpisFinanzas(rango);
  }

  @Get('contabilidad/finanzas/balance-dias')
  async getBalanceDias(@Query() rango: RangoFechaDto) {
    return this.expensesService.getBalanceDias(rango);
  }

  @Get('contabilidad/finanzas/evolucion')
  async getEvolucion(@Query() rango: RangoFechaDto) {
    return this.expensesService.getEvolucion(rango);
  }

  @Get('contabilidad/finanzas/top-dias')
  async getTopDias(
    @Query() rango: RangoFechaDto,
    @Query('limit') limit?: unknown
  ) {
    const limitNum = limit ? Number(limit) : 5;
    return this.expensesService.getTopDias(rango, isNaN(limitNum) ? 5 : limitNum);
  }

  @Get('contabilidad/finanzas/distribucion')
  async getDistribucion(@Query() rango: RangoFechaDto) {
    return this.expensesService.getDistribucion(rango);
  }

  // ==========================================
  // CONTABILIDAD - MESAS
  // ==========================================

  @Get('contabilidad/mesas/ingresos')
  async getIngresosPorMesa(
    @Query() rango: RangoFechaDto,
    @Query('limit') limit?: unknown
  ) {
    const limitNum = limit ? Number(limit) : 10;
    return this.expensesService.getIngresosPorMesa(rango, isNaN(limitNum) ? 10 : limitNum);
  }

  @Get('contabilidad/mesas/horas-punta')
  async getHorasPuntaPorMesa(@Query() rango: RangoFechaDto) {
    return this.expensesService.getHorasPuntaPorMesa(rango);
  }

  // ==========================================
  // CONTABILIDAD - PRODUCTOS
  // ==========================================

  @Get('contabilidad/productos/top')
  async getTopProductos(
    @Query() rango: RangoFechaDto,
    @Query('limit') limit?: unknown
  ) {
    const limitNum = limit ? Number(limit) : 10;
    return this.expensesService.getTopProductos(rango, isNaN(limitNum) ? 10 : limitNum);
  }

  @Get('contabilidad/productos/categoria')
  async getIngresosPorCategoria(@Query() rango: RangoFechaDto) {
    return this.expensesService.getIngresosPorCategoria(rango);
  }

  // ==========================================
  // CONTABILIDAD - CLIENTES
  // ==========================================

  @Get('contabilidad/clientes/kpis')
  async getKpisClientes(@Query() rango: RangoFechaDto) {
    return this.expensesService.getKpisClientes(rango);
  }

  @Get('contabilidad/clientes/nuevos-recurrentes')
  async getNuevosRecurrentes(@Query() rango: RangoFechaDto) {
    return this.expensesService.getNuevosRecurrentes(rango);
  }

  @Get('contabilidad/clientes/actividad')
  async getActividadClientes(@Query() rango: RangoFechaDto) {
    return this.expensesService.getActividadClientes(rango);
  }

  @Get('contabilidad/clientes/top-gasto')
  async getTopClientesGasto(
    @Query() rango: RangoFechaDto,
    @Query('limit') limit?: unknown
  ) {
    const limitNum = limit ? Number(limit) : 10;
    return this.expensesService.getTopClientesGasto(rango, isNaN(limitNum) ? 10 : limitNum);
  }

  @Get('contabilidad/clientes/top-pedidos')
  async getTopClientesPedidos(
    @Query() rango: RangoFechaDto,
    @Query('limit') limit?: unknown
  ) {
    const limitNum = limit ? Number(limit) : 10;
    return this.expensesService.getTopClientesPedidos(rango, isNaN(limitNum) ? 10 : limitNum);
  }

  @Get('contabilidad/clientes/frecuencia')
  async getFrecuenciaClientes(@Query() rango: RangoFechaDto) {
    return this.expensesService.getFrecuenciaClientes(rango);
  }

  @Get('contabilidad/clientes/ticket-promedio')
  async getTicketPromedioClientes(
    @Query() rango: RangoFechaDto,
    @Query('limit') limit?: unknown
  ) {
    const parsedLimit = limit ? Number(limit) : 10;
    return this.expensesService.getTicketPromedioClientes(rango, parsedLimit);
  }

  // ==========================================
  // CONTABILIDAD - DELIVERY
  // ==========================================

  @Get('contabilidad/delivery/kpis')
  async getKpisDelivery(@Query() rango: RangoFechaDto) {
    return this.expensesService.getKpisDelivery(rango);
  }

  @Get('contabilidad/delivery/pedidos-dia')
  async getPedidosDeliveryPorDia(@Query() rango: RangoFechaDto) {
    return this.expensesService.getPedidosDeliveryPorDia(rango);
  }

  @Get('contabilidad/delivery/tiempo-despacho')
  async getTiempoDespacho(@Query() rango: RangoFechaDto) {
    return this.expensesService.getTiempoDespacho(rango);
  }

  @Get('contabilidad/delivery/estados')
  async getEstadosDelivery(@Query() rango: RangoFechaDto) {
    return this.expensesService.getEstadosDelivery(rango);
  }

  @Get('contabilidad/delivery/recaudacion')
  async getRecaudacionDelivery(@Query() rango: RangoFechaDto) {
    return this.expensesService.getRecaudacionDelivery(rango);
  }

  @Get('contabilidad/delivery/clientes')
  async getClientesDelivery(@Query() rango: RangoFechaDto) {
    return this.expensesService.getClientesDelivery(rango);
  }

  @Get('contabilidad/delivery/top-barrios')
  async getTopBarrios(
    @Query() rango: RangoFechaDto,
    @Query('limit') limit?: unknown
  ) {
    const limitNum = limit ? Number(limit) : 10;
    return this.expensesService.getTopBarrios(rango, isNaN(limitNum) ? 10 : limitNum);
  }

  // ==========================================
  // CONTABILIDAD - GASTOS
  // ==========================================

  @Get('contabilidad/gastos/kpis')
  async getKpisGastos(@Query() rango: RangoFechaDto) {
    return this.expensesService.getKpisGastos(rango);
  }

  @Get('contabilidad/gastos/por-categoria')
  async getGastosPorCategoria(@Query() rango: RangoFechaDto) {
    return this.expensesService.getGastosPorCategoria(rango);
  }

  @Get('contabilidad/gastos/por-medio-pago')
  async getGastosPorMedioPago(@Query() rango: RangoFechaDto) {
    return this.expensesService.getGastosPorMedioPago(rango);
  }

  @Get('contabilidad/gastos/evolucion')
  async getEvolucionGastos(@Query() rango: RangoFechaDto) {
    return this.expensesService.getEvolucionGastos(rango);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateGastoDto: UpdateGastoDto,
    @Req() req: any
  ) {
    return this.expensesService.update(id, updateGastoDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('soft/:id')
  removeSoft(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ) {
    return this.expensesService.removeSoft(id, req.user);
  }

}


