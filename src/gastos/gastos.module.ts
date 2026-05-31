import { Module } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { GastosController } from './gastos.controller';
import { Gasto } from './entities/gasto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { CategoriaGasto } from 'src/categoria-gasto/entities/categoria-gasto.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { Order } from 'src/orders/entities/order.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Eta } from 'src/eta/entities/eta.entity';
import { ProveedoresModule } from 'src/proveedores/proveedores.module';
import { UsersModule } from 'src/users/users.module';
import { ProveedorCategoriaGasto } from './entities/proveedor-categoria-gasto.entity';
import { TicketBar } from 'src/ticket-bar/entities/ticket-bar.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Gasto,
      Customer,
      CategoriaGasto,
      Order,
      ProductsOrders,
      Product,
      Mesa,
      Category,
      Eta,
      ProveedorCategoriaGasto,
      TicketBar
    ]),
    ScheduleModule.forRoot(),
    ProveedoresModule,
    UsersModule
  ],
  controllers: [GastosController],
  providers: [GastosService],
})
export class GastosModule { }
