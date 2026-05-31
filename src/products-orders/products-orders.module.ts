import { Module } from '@nestjs/common';
import { ProductsOrdersService } from './products-orders.service';
import { ProductsOrdersController } from './products-orders.controller';

@Module({
  controllers: [ProductsOrdersController],
  providers: [ProductsOrdersService],
})
export class ProductsOrdersModule {}
