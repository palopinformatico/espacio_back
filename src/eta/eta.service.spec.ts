import { Test, TestingModule } from '@nestjs/testing';
import { EtaService } from './eta.service';

describe('EtaService', () => {
  let service: EtaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EtaService],
    }).compile();

    service = module.get<EtaService>(EtaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
