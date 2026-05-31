import { Test, TestingModule } from '@nestjs/testing';
import { ProductsOrdersController } from './products-orders.controller';
import { ProductsOrdersService } from './products-orders.service';

describe('ProductsOrdersController', () => {
  let controller: ProductsOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsOrdersController],
      providers: [ProductsOrdersService],
    }).compile();

    controller = module.get<ProductsOrdersController>(ProductsOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
