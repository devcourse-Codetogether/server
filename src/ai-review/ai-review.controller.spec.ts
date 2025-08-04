import { Test, TestingModule } from '@nestjs/testing';
import { AiReviewController } from './ai-review.controller';

describe('AiReviewController', () => {
  let controller: AiReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiReviewController],
    }).compile();

    controller = module.get<AiReviewController>(AiReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
