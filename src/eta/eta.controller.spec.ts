import { Test, TestingModule } from '@nestjs/testing';
import { EtaController } from './eta.controller';
import { EtaService } from './eta.service';

describe('EtaController', () => {
  let controller: EtaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtaController],
      providers: [EtaService],
    }).compile();

    controller = module.get<EtaController>(EtaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
