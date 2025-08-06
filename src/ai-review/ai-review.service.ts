import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpenAiService } from './openai.service';

@Injectable()
export class AiReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openaiService: OpenAiService,
  ) {}

  async reviewCode(sessionId: number, question: string): Promise<{ answer: string }> {
    const latestCodeLog = await this.prisma.codeLog.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestCodeLog) {
      throw new NotFoundException('해당 세션에 저장된 코드가 없습니다.');
    }

    const prompt = `아래 코드를 참고해서 200자 이내로 코드 리뷰를 해주세요.\n\n질문: ${question}\n\n코드:\n${latestCodeLog.code}`;
    const answer = await this.openaiService.send(prompt);
    return { answer };
  }

  async askQuestion(sessionId: number, question: string): Promise<{ answer: string }> {
    const prompt = `다음 질문을 200자 이내로 답해주세요:\n\n${question}`;
    const answer = await this.openaiService.send(prompt);
    return { answer };
  }
}
