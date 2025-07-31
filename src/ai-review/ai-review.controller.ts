import { Controller, Post, UseGuards, Param, ParseIntPipe, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiReviewService } from './ai-review.service';
import { User } from '../user/decorators/user.decorator';
import { UserDto } from '../user/dto/user.dto';

// src/ai-review/ai-review.controller.ts

@Controller('sessions/:id/ai')
export class AiReviewController {
  constructor(private readonly aiReviewService: AiReviewService) {}

  // 코드 기반 리뷰
  @UseGuards(JwtAuthGuard)
  @Post('review')
  async reviewCode(
    @User() user: UserDto,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body('question') question: string,
  ) {
    return this.aiReviewService.reviewCode(sessionId, question);
  }

  // 일반 질문 (코드 없음)
  @UseGuards(JwtAuthGuard)
  @Post('question')
  async askQuestion(
    @User() user: UserDto,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body('question') question: string,
  ) {
    return this.aiReviewService.askQuestion(sessionId, question);
  }
}
