import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MesaService } from './mesas.service';
import { MesaController } from './mesas.controller';
import { Mesa } from './entities/mesa.entity';
import { Order } from '../orders/entities/order.entity';
import { ProductsOrders } from '../products-orders/entities/products-order.entity';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mesa, Order, ProductsOrders]),
    OrdersModule, // para poder inyectar OrdersGateway
  ],
  controllers: [MesaController],
  providers: [MesaService],
})
export class MesasModule {}
