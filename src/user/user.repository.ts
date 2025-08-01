import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserSessions(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        sessions: true,
        joined: true,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return [...(user.sessions || []), ...(user.joined || [])];
  }
}
