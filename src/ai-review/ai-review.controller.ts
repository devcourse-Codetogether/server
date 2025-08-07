import { Controller, Post, UseGuards, Param, ParseIntPipe, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiReviewService } from './ai-review.service';
import { User } from '../user/decorators/user.decorator';
import { UserDto } from '../user/dto/user.dto';

@Controller('sessions/:sessionId/ai')
export class AiReviewController {
  constructor(private readonly aiReviewService: AiReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post('review')
  async reviewCode(@User() user: UserDto, @Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.aiReviewService.reviewCode(sessionId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('question')
  async askQuestion(
    @User() user: UserDto,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body('question') question: string,
  ) {
    return this.aiReviewService.askQuestion(sessionId, question);
  }
}
