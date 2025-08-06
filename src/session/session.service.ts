import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { last } from 'rxjs';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionList(page: number, limit: number) {
    const [sessions] = await Promise.all([
      this.prisma.session.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          participants: true,
        },
      }),
    ]);

    return {
      sessions: sessions.map(s => ({
        id: s.id,
        title: s.title,
        mode: s.mode,
        language: s.language,
        participants: s.participants.length,
      })),
    };
  }

  async createSession(userId: number, dto: CreateSessionDto) {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const session = await this.prisma.session.create({
      data: {
        ...dto,
        joinCode,
        ownerId: userId,
        participants: { connect: { id: userId } },
      },
    });

    return {
      id: session.id,
      joinCode: session.joinCode,
    };
  }

  async joinSessionById(userId: number, sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session) {
      throw new NotFoundException('세션이 존재하지 않습니다.');
    }

    const alreadyJoined = session.participants.some(p => p.id === userId);

    if (!alreadyJoined) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          participants: { connect: { id: userId } },
        },
      });
      session.participants.push({ id: userId, nickname: '' } as any);
    }

    return {
      id: session.id,
      title: session.title,
      alreadyJoined,
      participants: session.participants.map(p => ({
        id: p.id,
        nickname: p.nickname,
      })),
    };
  }
}
