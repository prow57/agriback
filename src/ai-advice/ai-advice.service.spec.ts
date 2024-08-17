import { Test, TestingModule } from '@nestjs/testing';
import { AiAdviceService } from './ai-advice.service';

describe('AiAdviceService', () => {
  let service: AiAdviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiAdviceService],
    }).compile();

    service = module.get<AiAdviceService>(AiAdviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
