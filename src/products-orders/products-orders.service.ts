import { Injectable } from '@nestjs/common';
import { CreateProductsOrderDto } from './dto/create-products-order.dto';
import { UpdateProductsOrderDto } from './dto/update-products-order.dto';

@Injectable()
export class ProductsOrdersService {
  create(createProductsOrderDto: CreateProductsOrderDto) {
    return 'This action adds a new productsOrder';
  }

  findAll() {
    return `This action returns all productsOrders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productsOrder`;
  }

  update(id: number, updateProductsOrderDto: UpdateProductsOrderDto) {
    return `This action updates a #${id} productsOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} productsOrder`;
  }
}
