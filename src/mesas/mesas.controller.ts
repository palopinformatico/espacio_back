import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { MesaService } from './mesas.service';
import { Mesa } from './entities/mesa.entity';
import { Order } from 'src/orders/entities/order.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('mesas')
export class MesaController {
  constructor(private readonly mesaService: MesaService) {}

  @Patch(':id/pagar')
async marcarPedidoPagado(@Param('id') mesaId: number) {
  return await this.mesaService.marcarPedidoPagado(mesaId);
}


  @Get(':id/detalle-actual')
async getDetalleMesaActual(@Param('id', ParseIntPipe) id: number) {
  return this.mesaService.obtenerDetalleMesaActual(id);
}


    @Get('historial')
async getHistorialPorMesas(@Query('mesaId', ParseIntPipe) mesaId: number) {
  return this.mesaService.getPedidosPorMesa(mesaId);
}


  @Get()
  findAll(): Promise<Mesa[]> {
    return this.mesaService.findAll();
  }

    @Get('/obtener/:id')
    
  async obtenerMesaPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.mesaService.obtenerMesaPorId(id);
  }

  @Get('/detalle/:id')

  async getDetalleMesa(@Param('id', ParseIntPipe) id: number): Promise<Mesa> {
    return this.mesaService.obtenerDetalleMesa(id);
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Mesa> {
    return this.mesaService.findOne(id);
  }

  @Post()
  create(@Body() createMesaDto: CreateMesaDto): Promise<Mesa> {
    return this.mesaService.create(createMesaDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMesaDto: UpdateMesaDto,
  ): Promise<Mesa> {
    return this.mesaService.update(id, updateMesaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mesaService.remove(id);
  }

  @Put(':id/estado')
  async actualizarEstadoMesa(
    @Param('id') id: number,
    @Body('status') status: string,
  ) {
    return this.mesaService.actualizarEstadoMesa(id, status);
  }




  @Get(':id')
  getMesa(@Param('id') id: number): Promise<Mesa> {
    return this.mesaService.getMesa(id);
  }


 

  @Post(':id/nuevo-pedido')
  crearNuevoPedido(@Param('id') id: number): Promise<Order> {
    return this.mesaService.crearNuevoPedido(id);
  }

  @Get(':id/pedidos')
  getPedidosActuales(
    @Param('id') id: number,
    @Query('numeroVenta') numeroVenta: number,
  ): Promise<Order[]> {
    return this.mesaService.getPedidosActuales(id, numeroVenta);
  }

@Get('ventas/detalle-mesa')
async getDetalleMesas(
  @Query('mesaId') mesaId: number,
  @Query('fecha') fecha?: string,
) {
  return this.mesaService.getMesaDetail(mesaId, fecha);
}

@Patch('ventas/:orderId')
async updateDetalleVenta(
  @Param('orderId', ParseIntPipe) orderId: number,
  @Body() updateData: {
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
) {
  return this.mesaService.updateDetalleVenta(orderId, updateData);
}




}