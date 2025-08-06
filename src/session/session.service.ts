import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { last } from 'rxjs';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionList(page: number, limit: number) {
    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where: { isEnded: false },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          participants: true,
        },
      }),
      this.prisma.session.count({ where: { isEnded: false } }),
    ]);

    return {
      sessions: sessions.map(s => ({
        id: s.id,
        title: s.title,
        mode: s.mode,
        language: s.language,
        participants: s.participants.length,
      })),
      total,
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

    if (!session || session.isEnded) {
      throw new NotFoundException('세션이 존재하지 않거나 종료되었습니다.');
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

  async endSession(userId: number, sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');
    if (session.ownerId !== userId) throw new ForbiddenException('세션 종료 권한이 없습니다.');

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isEnded: true,
      },
    });
  }
}
