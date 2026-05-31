import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Customer,Order])],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
