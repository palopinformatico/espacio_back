import { Test, TestingModule } from '@nestjs/testing';
import { CostoEnvioController } from './costo_envio.controller';
import { CostoEnvioService } from './costo_envio.service';

describe('CostoEnvioController', () => {
  let controller: CostoEnvioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CostoEnvioController],
      providers: [CostoEnvioService],
    }).compile();

    controller = module.get<CostoEnvioController>(CostoEnvioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
