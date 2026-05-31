import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { PrintService } from './print/print.service';
import { OrdersGateway } from './orders.gateway';
import { MailModule } from 'src/mail/mail.module';
import { CostoEnvio } from 'src/costo_envio/entities/costo_envio.entity';
import { EtaModule } from 'src/eta/eta.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      User,
      Customer,
      Product,
      Mesa,
      ProductsOrders,
      CostoEnvio,
    ]),
    MailModule,
    EtaModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PrintService,
    OrdersGateway, // ✅ AGREGADO AQUÍ
  ],
  exports: [
    OrdersGateway, // ✅ SOLO ahora tiene sentido exportarlo
  ],
})
export class OrdersModule { }

