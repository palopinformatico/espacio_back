import { PartialType } from '@nestjs/mapped-types';
import { CreateProductsOrderDto } from './create-products-order.dto';

export class UpdateProductsOrderDto extends PartialType(CreateProductsOrderDto) {}
