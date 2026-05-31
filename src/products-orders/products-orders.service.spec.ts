import { Test, TestingModule } from '@nestjs/testing';
import { ProductsOrdersService } from './products-orders.service';

describe('ProductsOrdersService', () => {
  let service: ProductsOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsOrdersService],
    }).compile();

    service = module.get<ProductsOrdersService>(ProductsOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
