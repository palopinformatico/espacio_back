import { Test, TestingModule } from '@nestjs/testing';
import { CostoEnvioService } from './costo_envio.service';

describe('CostoEnvioService', () => {
  let service: CostoEnvioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostoEnvioService],
    }).compile();

    service = module.get<CostoEnvioService>(CostoEnvioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
