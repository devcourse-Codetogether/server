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
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.isEnded || !session.codeLogs) {
      throw new NotFoundException('세션 코드가 존재하지 않거나 세션이 종료되었습니다.');
    }

    const prompt = `아래 코드를 참고해서 200자 이내로 질문에 답해주세요.\n\n질문: ${question}\n\n코드:\n${session.codeLogs}`;
    const answer = await this.openaiService.send(prompt);
    return { answer };
  }

  async askQuestion(sessionId: number, question: string): Promise<{ answer: string }> {
    const prompt = `다음 질문을 200자 이내로 답해주세요:\n\n${question}`;
    const answer = await this.openaiService.send(prompt);
    return { answer };
  }
}
