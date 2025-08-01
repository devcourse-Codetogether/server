import { Module } from '@nestjs/common';
import { AiReviewController } from './ai-review.controller';
import { AiReviewService } from './ai-review.service';
import { OpenAiService } from './openai.service';

@Module({
  controllers: [AiReviewController],
  providers: [AiReviewService, OpenAiService],
})
export class AiReviewModule {}
