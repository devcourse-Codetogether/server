import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // 데이터 저장
  async saveMessage(data: { sessionId: string; senderId: number; message: string }) {
    const sessionId = parseInt(data.sessionId);

    return this.prisma.chatMessage.create({
      data: {
        session: { connect: { id: sessionId } },
        sender: { connect: { id: data.senderId } },
        message: data.message,
      },
      include: {
        sender: { select: { id: true, nickname: true } },
      },
    });
  }

  // 데이터 불러오기
  async getMessagesBySession(sessionId: string) {
    const sessionIdInt = parseInt(sessionId);

    return this.prisma.chatMessage.findMany({
      where: { sessionId: sessionIdInt },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, nickname: true } },
      },
    });
  }
}
