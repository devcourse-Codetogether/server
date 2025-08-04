import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(data: { sessionId: number; senderId: number; message: string }) {
    return this.prisma.chatMessage.create({
      data: {
        session: { connect: { id: data.sessionId } },
        sender: { connect: { id: data.senderId } },
        message: data.message,
      },
      include: {
        sender: { select: { id: true, nickname: true } },
      },
    });
  }

  async getMessagesBySession(sessionId: number) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, nickname: true } },
      },
    });
  }
  async getRecentMessages(sessionId: number, limit = 15) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
  }
}
