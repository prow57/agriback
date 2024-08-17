import { Test, TestingModule } from '@nestjs/testing';
import { AiAdviceController } from './ai-advice.controller';

describe('AiAdviceController', () => {
  let controller: AiAdviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiAdviceController],
    }).compile();

    controller = module.get<AiAdviceController>(AiAdviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
