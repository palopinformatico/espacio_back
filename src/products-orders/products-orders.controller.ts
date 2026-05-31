import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsOrdersService } from './products-orders.service';
import { CreateProductsOrderDto } from './dto/create-products-order.dto';
import { UpdateProductsOrderDto } from './dto/update-products-order.dto';

@Controller('products-orders')
export class ProductsOrdersController {
  constructor(private readonly productsOrdersService: ProductsOrdersService) {}

  @Post()
  create(@Body() createProductsOrderDto: CreateProductsOrderDto) {
    return this.productsOrdersService.create(createProductsOrderDto);
  }

  @Get()
  findAll() {
    return this.productsOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsOrdersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductsOrderDto: UpdateProductsOrderDto) {
    return this.productsOrdersService.update(+id, updateProductsOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsOrdersService.remove(+id);
  }
}
