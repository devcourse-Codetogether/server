import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getMySessions(userId: number) {
    return this.userRepository.findUserSessions(userId);
  }
  async findByKakaoId(kakaoId: string) {
    return this.prisma.user.findUnique({
      where: { kakaoId },
    });
  }
  async createWithKakao(data: { kakaoId: string; nickname: string }) {
    return this.prisma.user.create({
      data,
    });
  }
}
