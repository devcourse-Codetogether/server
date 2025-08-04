import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(data: {
    sessionId: number;
    senderId: number;
    senderName: string;
    message: string;
  }) {
    return this.prisma.chatMessage.create({ data });
  }

  async getMessagesBySession(sessionId: number) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
