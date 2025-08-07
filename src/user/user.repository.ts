import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SimpleSessionDto } from '../user/dto/session.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private static SESSION_SELECT = {
    id: true,
    title: true,
    createdAt: true,
    language: true,
    mode: true,
    owner: {
      select: { nickname: true },
    },
  } satisfies Prisma.SessionSelect;

  async findUserSessions(userId: number): Promise<SimpleSessionDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        sessions: { select: UserRepository.SESSION_SELECT },
        joined: { select: UserRepository.SESSION_SELECT },
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const shape = (s: any) => ({
      id: s.id,
      title: s.title,
      language: s.language,
      mode: s.mode,
      createdAt: s.createdAt,
      ownerNickname: s.owner?.nickname ?? null,
    });

    const sessions = (user.sessions ?? []).map(shape);
    const joined = (user.joined ?? []).map(shape);

    return [...sessions, ...joined].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
